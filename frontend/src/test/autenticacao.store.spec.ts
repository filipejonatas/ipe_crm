import { PERFIS } from '@ipe_crm/shared';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

const usuario = {
  id: 'usuario-1',
  nome: 'Admin',
  email: 'admin@ipecrm.com',
  perfil: PERFIS.ADMIN,
};

describe('autenticacao.store', () => {
  beforeEach(() => {
    useAutenticacaoStore.getState().logout();
    localStorage.clear();
  });

  it('login salva token e usuario e marca autenticado', () => {
    useAutenticacaoStore.getState().login('token-teste', usuario);

    expect(useAutenticacaoStore.getState()).toMatchObject({
      token: 'token-teste',
      usuario,
      autenticado: true,
    });
  });

  it('logout limpa token e usuario e marca nao autenticado', () => {
    useAutenticacaoStore.getState().login('token-teste', usuario);
    useAutenticacaoStore.getState().logout();

    expect(useAutenticacaoStore.getState()).toMatchObject({
      token: null,
      usuario: null,
      autenticado: false,
    });
  });
});
