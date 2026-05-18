import type { Perfil } from '@ipe_crm/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

interface AutenticacaoState {
  token: string | null;
  usuario: UsuarioAutenticado | null;
  autenticado: boolean;
  login: (token: string, usuario: UsuarioAutenticado) => void;
  logout: () => void;
}

export const useAutenticacaoStore = create<AutenticacaoState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      autenticado: false,
      login: (token, usuario) => set({ token, usuario, autenticado: true }),
      logout: () => set({ token: null, usuario: null, autenticado: false }),
    }),
    {
      name: 'ipe-crm-autenticacao',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
