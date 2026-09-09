import { BadRequestException } from '@nestjs/common';
import { ItemEstoque } from '../src/modules/estoque/entities/item-estoque.entity';
import { MovimentacaoEstoque } from '../src/modules/estoque/entities/movimentacao-estoque.entity';
import { ManutencaoPeca } from '../src/modules/manutencoes/entities/manutencao-peca.entity';
import { ManutencaoVeiculo } from '../src/modules/manutencoes/entities/manutencao-veiculo.entity';
import { ManutencoesVeiculoService } from '../src/modules/manutencoes/manutencoes-veiculo.service';

function preparar(saldo = 10) {
  const item = Object.assign(new ItemEstoque(), {
    id: 'i1',
    descricao: 'Filtro',
    ativo: true,
    saldo_atual: saldo,
  });
  const manutencao = Object.assign(new ManutencaoVeiculo(), {
    id: 'm1',
    veiculo: { id: 'v1' },
    usuario: { id: 'u1' },
    data_manutencao: '2026-09-09',
    troca_oleo: false,
    custo_mao_obra: 20,
    pecas: [
      Object.assign(new ManutencaoPeca(), {
        id: 'p1',
        item_estoque: item,
        descricao_peca: 'Filtro',
        quantidade: 2,
        preco_unitario: 5,
        valor_total: 10,
      }),
    ],
  });
  const manager = {
    findOne: jest.fn((tipo: unknown) => Promise.resolve(tipo === ItemEstoque ? item : manutencao)),
    create: jest.fn((tipo: new () => object, dados: object) => Object.assign(new tipo(), dados)),
    save: jest.fn((entidade: object) => Promise.resolve(entidade)),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  const transaction = jest.fn((fn: (m: typeof manager) => unknown) => fn(manager));
  const service = new ManutencoesVeiculoService(
    { transaction } as never,
    { findOne: jest.fn().mockResolvedValue(manutencao) } as never,
  );
  return { service, manager, transaction, manutencao, item };
}

describe('Edição de peças da manutenção', () => {
  it('adiciona peças com baixa apenas da diferença e recalcula o total', async () => {
    const { service, manager, transaction, item } = preparar();
    const resposta = await service.atualizar('m1', {
      pecas: [
        { item_estoque_id: 'i1', quantidade: 2, preco_unitario: 5 },
        { item_estoque_id: 'i1', quantidade: 1, preco_unitario: 5 },
        { descricao_peca: 'Arruela', quantidade: 1, preco_unitario: 3 },
      ],
    });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(item.saldo_atual).toBe(9);
    expect(resposta.custo_total).toBe(38);
    expect(resposta.pecas).toHaveLength(3);
    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'saida',
        quantidade: 1,
        saldo_anterior: 10,
        saldo_posterior: 9,
      }),
    );
  });

  it('não dá nova baixa quando só altera o preço e a descrição', async () => {
    const { service, manager, item } = preparar(0);
    const resposta = await service.atualizar('m1', {
      pecas: [
        {
          item_estoque_id: 'i1',
          descricao_peca: 'Filtro revisado',
          quantidade: 2,
          preco_unitario: 8,
        },
      ],
    });
    expect(item.saldo_atual).toBe(0);
    expect(resposta.custo_total).toBe(36);
    expect(
      manager.save.mock.calls.some(([entidade]) => entidade instanceof MovimentacaoEstoque),
    ).toBe(false);
  });

  it('devolve o consumo removido e aceita lista vazia', async () => {
    const { service, manager, item } = preparar();
    const resposta = await service.atualizar('m1', { pecas: [] });
    expect(item.saldo_atual).toBe(12);
    expect(resposta.pecas).toEqual([]);
    expect(resposta.custo_total).toBe(20);
    expect(manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'entrada', quantidade: 2 }),
    );
  });

  it('preserva as peças quando o PATCH não inclui a lista', async () => {
    const { service, manager } = preparar();
    const resposta = await service.atualizar('m1', { custo_mao_obra: 30 });
    expect(resposta.pecas).toHaveLength(1);
    expect(resposta.custo_total).toBe(40);
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('rejeita saldo insuficiente antes de substituir as peças', async () => {
    const { service, manager, item } = preparar(0);
    await expect(
      service.atualizar('m1', {
        pecas: [{ item_estoque_id: 'i1', quantidade: 3, preco_unitario: 5 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.delete).not.toHaveBeenCalled();
    expect(item.saldo_atual).toBe(0);
  });
});
