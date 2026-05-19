import { BadRequestException } from '@nestjs/common';
import { CategoriaItemEstoque } from '../src/modules/estoque/entities/categoria-item-estoque.enum';
import { ItemEstoque } from '../src/modules/estoque/entities/item-estoque.entity';
import { ItemEstoqueVeiculo } from '../src/modules/estoque/entities/item-estoque-veiculo.entity';
import { OrigemMovimentacaoEstoque } from '../src/modules/estoque/entities/origem-movimentacao-estoque.enum';
import { TipoMovimentacaoEstoque } from '../src/modules/estoque/entities/tipo-movimentacao-estoque.enum';
import { MovimentacoesEstoqueService } from '../src/modules/estoque/movimentacoes-estoque.service';

function criarItem(saldo = 10, categoria = CategoriaItemEstoque.OUTRO): ItemEstoque {
  return {
    id: 'item-1',
    codigo: null,
    descricao: 'Filtro',
    marca: null,
    categoria,
    unidade_medida: 'un',
    saldo_atual: saldo,
    estoque_minimo: 1,
    ativo: true,
    observacoes: null,
    criado_em: new Date(),
    atualizado_em: new Date(),
    excluido_em: null,
  };
}

function criarService(
  item = criarItem(),
  opcoes: { compativel?: boolean; possuiVinculo?: boolean } = {},
) {
  const manager = {
    findOne: jest.fn(
      (
        entidade: { name: string },
        parametros: { where: { id: string } },
      ): Promise<ItemEstoque | ItemEstoqueVeiculo | { id: string; placa: string } | null> => {
        const nome = entidade.name;
        if (nome === 'ItemEstoque') return Promise.resolve(item);
        if (nome === 'Veiculo')
          return Promise.resolve({ id: parametros.where.id, placa: 'ABC1234' });
        if (nome === 'ItemEstoqueVeiculo') {
          return Promise.resolve(
            opcoes.compativel ? ({ id: 'vinculo-1' } as ItemEstoqueVeiculo) : null,
          );
        }
        return Promise.resolve(null);
      },
    ),
    count: jest.fn(() => Promise.resolve(opcoes.possuiVinculo ? 1 : 0)),
    create: jest.fn((_entidade: unknown, dados: object) => ({ id: 'mov-1', ...dados })),
    save: jest.fn(<T>(registro: T): Promise<T> => Promise.resolve(registro)),
  };
  const dataSource = {
    transaction: jest.fn((callback: (m: typeof manager) => unknown) => callback(manager)),
  };
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'mov-1' }], 1]),
  };
  const repository = { createQueryBuilder: jest.fn(() => qb) };
  const service = new MovimentacoesEstoqueService(dataSource as never, repository as never);
  return { service, manager, qb, item };
}

describe('MovimentacoesEstoqueService', () => {
  it('registrarEntrada aumenta saldo', async () => {
    const { service, item } = criarService(criarItem(3));

    await service.registrarEntrada({
      item_estoque_id: 'item-1',
      quantidade: 4,
      origem: OrigemMovimentacaoEstoque.SALDO_INICIAL,
      usuarioAtual: { id: 'usuario-1' },
    });

    expect(item.saldo_atual).toBe(7);
  });

  it('registrarSaida reduz saldo', async () => {
    const { service, item } = criarService(criarItem(10));

    await service.registrarSaida({ item_estoque_id: 'item-1', quantidade: 4 }, { id: 'usuario-1' });

    expect(item.saldo_atual).toBe(6);
  });

  it('registrarSaida lanca erro quando saldo e insuficiente', async () => {
    const { service } = criarService(criarItem(2));

    await expect(
      service.registrarSaida({ item_estoque_id: 'item-1', quantidade: 3 }, { id: 'usuario-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registrarSaida lanca erro quando quantidade e zero ou negativa', async () => {
    const { service } = criarService();

    await expect(
      service.registrarSaida({ item_estoque_id: 'item-1', quantidade: 0 }, { id: 'usuario-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registrarSaida valida compatibilidade com veiculo quando houver vinculo', async () => {
    const { service } = criarService(criarItem(10, CategoriaItemEstoque.FILTRO), {
      possuiVinculo: true,
      compativel: false,
    });

    await expect(
      service.registrarSaida(
        { item_estoque_id: 'item-1', quantidade: 1, veiculo_id: 'veiculo-1' },
        { id: 'usuario-1' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registrarSaida exige veiculo quando item e filtro', async () => {
    const { service } = criarService(criarItem(10, CategoriaItemEstoque.FILTRO));

    await expect(
      service.registrarSaida({ item_estoque_id: 'item-1', quantidade: 1 }, { id: 'usuario-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registrarAjuste altera saldo para o novo valor', async () => {
    const { service, item } = criarService(criarItem(10));

    await service.registrarAjuste(
      { item_estoque_id: 'item-1', novo_saldo: 8, motivo: 'Correcao' },
      { id: 'usuario-1' },
    );

    expect(item.saldo_atual).toBe(8);
  });

  it('registrarAjuste lanca erro quando novo saldo e igual ao atual', async () => {
    const { service } = criarService(criarItem(10));

    await expect(
      service.registrarAjuste(
        { item_estoque_id: 'item-1', novo_saldo: 10, motivo: 'Correcao' },
        { id: 'usuario-1' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('listar retorna movimentacoes paginadas', async () => {
    const { service } = criarService();

    const resposta = await service.listar({
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem: OrigemMovimentacaoEstoque.UTILIZACAO_OFICINA,
    });

    expect(resposta.total).toBe(1);
    expect(resposta.pagina).toBe(1);
  });
});
