import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriaItemEstoque } from '../src/modules/estoque/entities/categoria-item-estoque.enum';
import { ItemEstoque } from '../src/modules/estoque/entities/item-estoque.entity';
import { ItensEstoqueService } from '../src/modules/estoque/itens-estoque.service';

type MockRepository<T> = jest.Mocked<
  Pick<Repository<T>, 'create' | 'save' | 'findOne' | 'find' | 'delete'>
> & {
  createQueryBuilder: jest.Mock;
};

function criarItem(sobrescritas: Partial<ItemEstoque> = {}): ItemEstoque {
  return {
    id: 'item-1',
    codigo: 'FIL-001',
    descricao: 'Filtro de oleo',
    marca: 'Tecfil',
    categoria: CategoriaItemEstoque.FILTRO,
    unidade_medida: 'un',
    saldo_atual: 10,
    estoque_minimo: 2,
    ativo: true,
    observacoes: null,
    criado_em: new Date('2026-01-01T00:00:00.000Z'),
    atualizado_em: new Date('2026-01-01T00:00:00.000Z'),
    excluido_em: null,
    ...sobrescritas,
  };
}

function criarQueryBuilder(itens: ItemEstoque[] = [criarItem()], total = itens.length) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([itens, total]),
  };
}

describe('ItensEstoqueService', () => {
  let service: ItensEstoqueService;
  let repository: MockRepository<ItemEstoque>;
  const movimentacoesService = { registrarEntrada: jest.fn() };

  beforeEach(() => {
    repository = {
      create: jest.fn((item: Partial<ItemEstoque>) => criarItem(item)),
      save: jest.fn((item: ItemEstoque) => Promise.resolve(item)),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => criarQueryBuilder()),
    };
    movimentacoesService.registrarEntrada.mockReset();
    service = new ItensEstoqueService(
      repository as unknown as Repository<ItemEstoque>,
      { delete: jest.fn(), find: jest.fn(), save: jest.fn(), create: jest.fn() } as never,
      { find: jest.fn() } as never,
      movimentacoesService as never,
    );
  });

  it('criar cria item com saldo zero quando nao ha saldo inicial', async () => {
    repository.findOne.mockResolvedValueOnce(criarItem({ saldo_atual: 0 }));

    await service.criar({
      descricao: 'Filtro',
      categoria: CategoriaItemEstoque.FILTRO,
      estoque_minimo: 1,
    });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ saldo_atual: 0 }));
    expect(movimentacoesService.registrarEntrada).not.toHaveBeenCalled();
  });

  it('criar cria movimentacao de entrada quando saldo_inicial > 0', async () => {
    repository.findOne.mockResolvedValueOnce(criarItem({ saldo_atual: 5 }));

    await service.criar({
      descricao: 'Filtro',
      categoria: CategoriaItemEstoque.FILTRO,
      saldo_inicial: 5,
    });

    expect(movimentacoesService.registrarEntrada).toHaveBeenCalledWith(
      expect.objectContaining({ item_estoque_id: 'item-1', quantidade: 5 }),
    );
  });

  it('criar lanca ConflictException para codigo duplicado', async () => {
    repository.findOne.mockResolvedValue(criarItem());

    await expect(
      service.criar({
        codigo: 'FIL-001',
        descricao: 'Filtro',
        categoria: CategoriaItemEstoque.FILTRO,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('listar filtra por categoria', async () => {
    const qb = criarQueryBuilder();
    repository.createQueryBuilder.mockReturnValue(qb);

    await service.listar({ categoria: CategoriaItemEstoque.FILTRO });

    expect(qb.andWhere).toHaveBeenCalledWith('item.categoria = :categoria', {
      categoria: CategoriaItemEstoque.FILTRO,
    });
  });

  it('listar filtra por baixo estoque', async () => {
    const qb = criarQueryBuilder();
    repository.createQueryBuilder.mockReturnValue(qb);

    await service.listar({ baixo_estoque: true });

    expect(qb.andWhere).toHaveBeenCalledWith('item.saldo_atual <= item.estoque_minimo');
  });

  it('buscarPorId lanca NotFoundException para item excluido', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId('item-excluido')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('atualizar nao altera saldo_atual', async () => {
    const item = criarItem({ saldo_atual: 12 });
    repository.findOne.mockResolvedValueOnce(item).mockResolvedValueOnce(null);

    await service.atualizar('item-1', { descricao: 'Novo nome', estoque_minimo: 3 });

    expect(item.saldo_atual).toBe(12);
  });

  it('remover faz soft delete', async () => {
    const item = criarItem();
    repository.findOne.mockResolvedValue(item);

    await service.remover('item-1');

    expect(item.excluido_em).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(item);
  });
});
