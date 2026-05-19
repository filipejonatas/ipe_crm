import { api } from '@/api/axios';

export interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface FiltrosFornecedores {
  busca?: string;
  ativo?: boolean;
  pagina?: number;
  limite?: number;
}

export interface CriarFornecedorDto {
  razao_social: string;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}
export type AtualizarFornecedorDto = Partial<CriarFornecedorDto>;

export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas?: number;
}

export const fornecedoresService = {
  async listar(filtros: FiltrosFornecedores): Promise<RespostaPaginada<Fornecedor>> {
    const { data } = await api.get<RespostaPaginada<Fornecedor>>('/api/v1/fornecedores', {
      params: filtros,
    });
    return data;
  },

  async buscarPorId(id: string): Promise<Fornecedor> {
    const { data } = await api.get<Fornecedor>(`/api/v1/fornecedores/${id}`);
    return data;
  },

  async criar(dto: CriarFornecedorDto): Promise<Fornecedor> {
    const { data } = await api.post<Fornecedor>('/api/v1/fornecedores', dto);
    return data;
  },

  async atualizar(id: string, dto: AtualizarFornecedorDto): Promise<Fornecedor> {
    const { data } = await api.patch<Fornecedor>(`/api/v1/fornecedores/${id}`, dto);
    return data;
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/api/v1/fornecedores/${id}`);
  },
};
