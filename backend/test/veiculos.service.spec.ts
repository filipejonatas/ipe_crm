import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Veiculo } from '../src/modules/veiculos/veiculo.entity';
import { VeiculosService } from '../src/modules/veiculos/veiculos.service';

type MockRepository = jest.Mocked<Pick<Repository<Veiculo>, 'create' | 'save' | 'findOne'>> & {
  createQueryBuilder: jest.Mock;
};

function criarVeiculo(sobrescritas: Partial<Veiculo> = {}): Veiculo {
  return {
    id: 'veiculo-1',
    placa: 'ABC1234',
    modelo: 'Cargo',
    marca: 'Ford',
    ano: 2020,
    observacoes: null,
    ativo: true,
    criado_em: new Date('2026-01-01T00:00:00.000Z'),
    atualizado_em: new Date('2026-01-01T00:00:00.000Z'),
    excluido_em: null,
    ...sobrescritas,
  };
}

describe('VeiculosService', () => {
  let service: VeiculosService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn((veiculo: Partial<Veiculo>) => criarVeiculo(veiculo)),
      save: jest.fn((veiculo: Veiculo) => Promise.resolve(veiculo)),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new VeiculosService(repository as unknown as Repository<Veiculo>);
  });

  it('criar salva veiculo corretamente', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.criar({ placa: 'abc-1234', modelo: 'Cargo', marca: 'Ford' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ placa: 'ABC1234', modelo: 'Cargo', marca: 'Ford' }),
    );
    expect(repository.save).toHaveBeenCalled();
  });

  it('criar lanca ConflictException para placa duplicada', async () => {
    repository.findOne.mockResolvedValue(criarVeiculo());

    await expect(
      service.criar({ placa: 'ABC1234', modelo: 'Cargo', marca: 'Ford' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('buscarPorId lanca NotFoundException para id inexistente ou excluido', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId('inexistente')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remover faz soft delete correto', async () => {
    const veiculo = criarVeiculo();
    repository.findOne.mockResolvedValue(veiculo);

    await service.remover(veiculo.id);

    expect(veiculo.excluido_em).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(veiculo);
  });
});
