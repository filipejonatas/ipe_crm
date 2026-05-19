import { api } from '@/api/axios';
import type { RespostaPaginada } from './fornecedores.service';
import type { Veiculo } from './veiculos.service';

export type CategoriaItemEstoque = 'filtro' | 'pneu' | 'ferramenta' | 'peca' | 'insumo' | 'outro';
export type TipoMovimentacaoEstoque = 'entrada' | 'saida' | 'ajuste';
export type OrigemMovimentacaoEstoque =
  | 'saldo_inicial'
  | 'utilizacao_oficina'
  | 'compra'
  | 'ajuste_manual';

export interface ItemEstoque {
  id: string;
  codigo: string | null;
  descricao: string;
  marca: string | null;
  categoria: CategoriaItemEstoque;
  unidade_medida: string;
  saldo_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface MovimentacaoEstoque {
  id: string;
  item_estoque?: ItemEstoque;
  tipo: TipoMovimentacaoEstoque;
  origem: OrigemMovimentacaoEstoque;
  quantidade: number;
  saldo_anterior: number;
  saldo_posterior: number;
  veiculo?: Veiculo | null;
  usuario?: { id: string; nome: string; email: string } | null;
  observacoes: string | null;
  criado_em: string;
}

export interface FiltrosItensEstoque {
  busca?: string;
  categoria?: CategoriaItemEstoque;
  ativo?: boolean;
  baixo_estoque?: boolean;
  pagina?: number;
  limite?: number;
}

export interface CriarItemEstoqueDto {
  codigo?: string | null;
  descricao: string;
  marca?: string | null;
  categoria: CategoriaItemEstoque;
  unidade_medida?: string;
  saldo_inicial?: number;
  estoque_minimo?: number;
  observacoes?: string | null;
}

export interface AtualizarItemEstoqueDto extends Omit<
  Partial<CriarItemEstoqueDto>,
  'saldo_inicial'
> {
  ativo?: boolean;
}

export interface RegistrarSaidaDto {
  item_estoque_id: string;
  quantidade: number;
  veiculo_id?: string;
  observacoes?: string | null;
}

export interface RegistrarAjusteDto {
  item_estoque_id: string;
  novo_saldo: number;
  motivo: string;
}

export interface FiltrosMovimentacoesEstoque {
  item_estoque_id?: string;
  tipo?: TipoMovimentacaoEstoque;
  origem?: OrigemMovimentacaoEstoque;
  veiculo_id?: string;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
  pagina?: number;
  limite?: number;
}

export const categoriasItemEstoque: CategoriaItemEstoque[] = [
  'filtro',
  'pneu',
  'ferramenta',
  'peca',
  'insumo',
  'outro',
];

export const estoqueService = {
  async listarItens(filtros: FiltrosItensEstoque): Promise<RespostaPaginada<ItemEstoque>> {
    const { data } = await api.get<RespostaPaginada<ItemEstoque>>('/api/v1/itens-estoque', {
      params: filtros,
    });
    return data;
  },

  async buscarItemPorId(id: string): Promise<ItemEstoque> {
    const { data } = await api.get<ItemEstoque>(`/api/v1/itens-estoque/${id}`);
    return data;
  },

  async criarItem(dto: CriarItemEstoqueDto): Promise<ItemEstoque> {
    const { data } = await api.post<ItemEstoque>('/api/v1/itens-estoque', dto);
    return data;
  },

  async atualizarItem(id: string, dto: AtualizarItemEstoqueDto): Promise<ItemEstoque> {
    const { data } = await api.patch<ItemEstoque>(`/api/v1/itens-estoque/${id}`, dto);
    return data;
  },

  async removerItem(id: string): Promise<void> {
    await api.delete(`/api/v1/itens-estoque/${id}`);
  },

  async listarVeiculosCompativeis(itemId: string): Promise<Veiculo[]> {
    const { data } = await api.get<Veiculo[]>(`/api/v1/itens-estoque/${itemId}/veiculos`);
    return data;
  },

  async vincularVeiculos(itemId: string, veiculosIds: string[]): Promise<ItemEstoque> {
    const { data } = await api.put<ItemEstoque>(`/api/v1/itens-estoque/${itemId}/veiculos`, {
      veiculos_ids: veiculosIds,
    });
    return data;
  },

  async registrarSaida(dto: RegistrarSaidaDto): Promise<MovimentacaoEstoque> {
    const { data } = await api.post<MovimentacaoEstoque>(
      '/api/v1/movimentacoes-estoque/saida',
      dto,
    );
    return data;
  },

  async registrarAjuste(dto: RegistrarAjusteDto): Promise<MovimentacaoEstoque> {
    const { data } = await api.post<MovimentacaoEstoque>(
      '/api/v1/movimentacoes-estoque/ajuste',
      dto,
    );
    return data;
  },

  async listarMovimentacoes(
    filtros: FiltrosMovimentacoesEstoque,
  ): Promise<RespostaPaginada<MovimentacaoEstoque>> {
    const { data } = await api.get<RespostaPaginada<MovimentacaoEstoque>>(
      '/api/v1/movimentacoes-estoque',
      { params: filtros },
    );
    return data;
  },

  async listarMovimentacoesDoItem(
    itemId: string,
    filtros: FiltrosMovimentacoesEstoque,
  ): Promise<RespostaPaginada<MovimentacaoEstoque>> {
    const { data } = await api.get<RespostaPaginada<MovimentacaoEstoque>>(
      `/api/v1/itens-estoque/${itemId}/movimentacoes`,
      { params: filtros },
    );
    return data;
  },
};
