import { api } from '@/api/axios';
import type { RespostaPaginada } from './fornecedores.service';

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface FiltrosVeiculos {
  busca?: string;
  ativo?: boolean;
  pagina?: number;
  limite?: number;
}

export interface CriarVeiculoDto {
  placa: string;
  modelo: string;
  marca: string;
  ano?: number | null;
  observacoes?: string | null;
  ativo?: boolean;
}
export type AtualizarVeiculoDto = Partial<CriarVeiculoDto>;

export const veiculosService = {
  async listar(filtros: FiltrosVeiculos): Promise<RespostaPaginada<Veiculo>> {
    const { data } = await api.get<RespostaPaginada<Veiculo>>('/api/v1/veiculos', {
      params: filtros,
    });
    return data;
  },

  async buscarPorId(id: string): Promise<Veiculo> {
    const { data } = await api.get<Veiculo>(`/api/v1/veiculos/${id}`);
    return data;
  },

  async criar(dto: CriarVeiculoDto): Promise<Veiculo> {
    const { data } = await api.post<Veiculo>('/api/v1/veiculos', dto);
    return data;
  },

  async atualizar(id: string, dto: AtualizarVeiculoDto): Promise<Veiculo> {
    const { data } = await api.patch<Veiculo>(`/api/v1/veiculos/${id}`, dto);
    return data;
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/api/v1/veiculos/${id}`);
  },
};
