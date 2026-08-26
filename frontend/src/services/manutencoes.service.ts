import { api } from '@/api/axios';
import type { RespostaPaginada } from './fornecedores.service';

export interface ManutencaoPeca {
  id: string;
  item_estoque_id: string | null;
  movimentacao_estoque_id: string | null;
  descricao_peca: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  criado_em: string;
}

export interface ManutencaoVeiculo {
  id: string;
  veiculo_id: string;
  placa: string;
  data_manutencao: string;
  descricao: string;
  quilometragem: number | null;
  custo_mao_obra: number;
  custo_total: number;
  observacoes: string | null;
  usuario_id: string;
  usuario_nome?: string;
  pecas: ManutencaoPeca[];
  criado_em: string;
  atualizado_em: string;
}

export interface PecaManutencaoDto {
  item_estoque_id?: string;
  descricao_peca?: string;
  quantidade: number;
  preco_unitario: number;
}

export interface CriarManutencaoVeiculoDto {
  veiculo_id: string;
  data_manutencao: string;
  descricao: string;
  quilometragem?: number | null;
  custo_mao_obra?: number;
  observacoes?: string | null;
  pecas?: PecaManutencaoDto[];
}

export type AtualizarManutencaoVeiculoDto = Partial<Omit<CriarManutencaoVeiculoDto, 'pecas'>>;

export interface FiltrosManutencoesVeiculo {
  veiculo_id?: string;
  placa?: string;
  data_inicio?: string;
  data_fim?: string;
  pagina?: number;
  limite?: number;
}

export const manutencoesService = {
  async listar(filtros: FiltrosManutencoesVeiculo): Promise<RespostaPaginada<ManutencaoVeiculo>> {
    const { data } = await api.get<RespostaPaginada<ManutencaoVeiculo>>(
      '/api/v1/manutencoes-veiculos',
      { params: filtros },
    );
    return data;
  },

  async buscarPorId(id: string): Promise<ManutencaoVeiculo> {
    const { data } = await api.get<ManutencaoVeiculo>(`/api/v1/manutencoes-veiculos/${id}`);
    return data;
  },

  async criar(dto: CriarManutencaoVeiculoDto): Promise<ManutencaoVeiculo> {
    const { data } = await api.post<ManutencaoVeiculo>('/api/v1/manutencoes-veiculos', dto);
    return data;
  },

  async atualizar(id: string, dto: AtualizarManutencaoVeiculoDto): Promise<ManutencaoVeiculo> {
    const { data } = await api.patch<ManutencaoVeiculo>(`/api/v1/manutencoes-veiculos/${id}`, dto);
    return data;
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/api/v1/manutencoes-veiculos/${id}`);
  },
};
