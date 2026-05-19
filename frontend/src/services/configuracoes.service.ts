import { api } from '@/api/axios';

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  descricao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface AtualizarConfiguracaoDto {
  valor: string;
  descricao?: string | null;
}

export const configuracoesService = {
  async listar(): Promise<Configuracao[]> {
    const { data } = await api.get<Configuracao[]>('/api/v1/configuracoes');
    return data;
  },

  async buscarPorChave(chave: string): Promise<Configuracao> {
    const { data } = await api.get<Configuracao>(`/api/v1/configuracoes/${chave}`);
    return data;
  },

  async atualizar(chave: string, dto: AtualizarConfiguracaoDto): Promise<Configuracao> {
    const { data } = await api.patch<Configuracao>(`/api/v1/configuracoes/${chave}`, dto);
    return data;
  },
};
