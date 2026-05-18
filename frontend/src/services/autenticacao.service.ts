import { api } from '@/api/axios';
import type { UsuarioAutenticado } from '@/store/autenticacao.store';

interface RespostaLogin {
  access_token: string;
  usuario: UsuarioAutenticado;
}

export const autenticacaoService = {
  async login(email: string, senha: string): Promise<RespostaLogin> {
    const { data } = await api.post<RespostaLogin>('/api/v1/autenticacao/login', {
      email,
      senha,
    });
    return data;
  },

  async eu(): Promise<UsuarioAutenticado> {
    const { data } = await api.get<UsuarioAutenticado>('/api/v1/autenticacao/eu');
    return data;
  },
};
