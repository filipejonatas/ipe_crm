import { BadRequestException } from '@nestjs/common';
import { ManutencoesVeiculoService } from '../src/modules/manutencoes/manutencoes-veiculo.service';

describe('Trocas de óleo', () => {
  it.each([0, -1, 100.5, 100000000, 50000])(
    'rejeita próxima quilometragem inválida: %s',
    async (km) => {
      const transaction = jest.fn();
      const service = new ManutencoesVeiculoService({ transaction } as never, {} as never);
      await expect(
        service.criar({
          veiculo_id: 'v1',
          descricao: 'Óleo',
          data_manutencao: '2026-09-09',
          troca_oleo: true,
          proxima_troca_oleo: '2027-03-09',
          quilometragem: 50000,
          proxima_troca_oleo_km: km,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it('salva e permite limpar a próxima quilometragem na edição', async () => {
    const registro = {
      id: 'm1',
      veiculo: { id: 'v1' },
      usuario: { id: 'u1' },
      data_manutencao: '2026-09-09',
      troca_oleo: true,
      proxima_troca_oleo: '2027-03-09',
      quilometragem: 50000,
      proxima_troca_oleo_km: 55000,
      pecas: [],
    };
    const repository = {
      findOne: jest.fn().mockResolvedValue(registro),
      save: jest.fn().mockResolvedValue({ id: 'm1' }),
    };
    const service = new ManutencoesVeiculoService(
      { transaction: (fn: (manager: typeof repository) => unknown) => fn(repository) } as never,
      repository as never,
    );
    await service.atualizar('m1', { proxima_troca_oleo_km: 60000 });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ proxima_troca_oleo_km: 60000 }),
    );
    await expect(service.atualizar('m1', { quilometragem: 61000 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await service.atualizar('m1', { proxima_troca_oleo_km: null });
    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ proxima_troca_oleo_km: null }),
    );
  });
  const registro = () => ({
    id: 'm1',
    veiculo: { id: 'v1' },
    usuario: { id: 'u1' },
    data_manutencao: '2026-09-09',
    troca_oleo: true,
    proxima_troca_oleo: '2027-03-09',
    pecas: [],
  });

  it.each([undefined, '2026-09-09', '2026-09-08', '2027-02-30'])(
    'rejeita próxima data inválida: %s',
    async (proxima) => {
      const transaction = jest.fn();
      const service = new ManutencoesVeiculoService({ transaction } as never, {} as never);
      await expect(
        service.criar({
          veiculo_id: 'v1',
          descricao: 'Óleo',
          data_manutencao: '2026-09-09',
          troca_oleo: true,
          proxima_troca_oleo: proxima,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it('persiste a marcação e a próxima data ao criar manutenção', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValue({ id: 'v1', placa: 'ABC1234' }),
      create: jest.fn((_tipo: unknown, dados: Record<string, unknown>) => dados),
      save: jest.fn().mockResolvedValue({ id: 'm1' }),
    };
    const service = new ManutencoesVeiculoService(
      { transaction: (fn: (m: typeof manager) => unknown) => fn(manager) } as never,
      { findOne: jest.fn().mockResolvedValue(registro()) } as never,
    );
    await service.criar({
      veiculo_id: 'v1',
      descricao: 'Óleo',
      data_manutencao: '2026-09-09',
      troca_oleo: true,
      proxima_troca_oleo: '2027-03-09',
    });
    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ troca_oleo: true, proxima_troca_oleo: '2027-03-09' }),
    );
  });

  it('limpa a próxima data ao desmarcar a troca na edição', async () => {
    const repository = {
      findOne: jest.fn().mockResolvedValue(registro()),
      save: jest.fn().mockResolvedValue({ id: 'm1' }),
    };
    const service = new ManutencoesVeiculoService(
      { transaction: (fn: (manager: typeof repository) => unknown) => fn(repository) } as never,
      repository as never,
    );
    await service.atualizar('m1', { troca_oleo: false });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ troca_oleo: false, proxima_troca_oleo: null }),
    );
  });

  it('revalida o prazo quando a data da manutenção é alterada', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(registro()), save: jest.fn() };
    const service = new ManutencoesVeiculoService(
      { transaction: (fn: (manager: typeof repository) => unknown) => fn(repository) } as never,
      repository as never,
    );
    await expect(service.atualizar('m1', { data_manutencao: '2027-04-01' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('consulta somente a última troca por veículo ativo em ordem do próximo prazo', async () => {
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const service = new ManutencoesVeiculoService(
      {} as never,
      { createQueryBuilder: () => query } as never,
    );
    await service.listar({ pagina: 2, limite: 10 }, true);
    expect(query.andWhere).toHaveBeenCalledWith('manutencao.troca_oleo = true');
    expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining('NOT EXISTS'));
    expect(query.andWhere).toHaveBeenCalledWith(
      'veiculo.ativo = true AND veiculo.excluido_em IS NULL',
    );
    expect(query.orderBy).toHaveBeenCalledWith('manutencao.proxima_troca_oleo', 'ASC');
    expect(query.skip).toHaveBeenCalledWith(10);
  });
});
