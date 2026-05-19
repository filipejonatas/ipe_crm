import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Fornecedor } from '../src/modules/fornecedores/fornecedor.entity';
import { FornecedoresService } from '../src/modules/fornecedores/fornecedores.service';

type MockRepository = jest.Mocked<Pick<Repository<Fornecedor>, 'create' | 'save' | 'findOne'>> & {
  createQueryBuilder: jest.Mock;
};

function criarFornecedor(sobrescritas: Partial<Fornecedor> = {}): Fornecedor {
  return {
    id: 'fornecedor-1',
    razao_social: 'Fornecedor Teste',
    nome_fantasia: null,
    cnpj: null,
    telefone: null,
    email: null,
    observacoes: null,
    ativo: true,
    criado_em: new Date('2026-01-01T00:00:00.000Z'),
    atualizado_em: new Date('2026-01-01T00:00:00.000Z'),
    excluido_em: null,
    ...sobrescritas,
  };
}

function criarQueryBuilder(resultado: Fornecedor[] = [], total = resultado.length) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([resultado, total]),
  };
}

describe('FornecedoresService', () => {
  let service: FornecedoresService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn((fornecedor: Partial<Fornecedor>) => criarFornecedor(fornecedor)),
      save: jest.fn((fornecedor: Fornecedor) => Promise.resolve(fornecedor)),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new FornecedoresService(repository as unknown as Repository<Fornecedor>);
  });

  it('criar salva fornecedor corretamente', async () => {
    await service.criar({ razao_social: 'Fornecedor Teste' });

    expect(repository.create).toHaveBeenCalledWith({ razao_social: 'Fornecedor Teste' });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ razao_social: 'Fornecedor Teste' }),
    );
  });

  it('listar retorna lista paginada ignorando excluidos', async () => {
    const fornecedor = criarFornecedor();
    const queryBuilder = criarQueryBuilder([fornecedor]);
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const resposta = await service.listar({ pagina: 1, limite: 10 });

    expect(queryBuilder.where).toHaveBeenCalledWith('fornecedor.excluido_em IS NULL');
    expect(resposta.total).toBe(1);
    expect(resposta.dados).toHaveLength(1);
  });

  it('buscarPorId lanca NotFoundException para id inexistente ou excluido', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId('inexistente')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remover preenche excluido_em sem deletar o registro', async () => {
    const fornecedor = criarFornecedor();
    repository.findOne.mockResolvedValue(fornecedor);

    await service.remover(fornecedor.id);

    expect(fornecedor.excluido_em).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(fornecedor);
  });
});
