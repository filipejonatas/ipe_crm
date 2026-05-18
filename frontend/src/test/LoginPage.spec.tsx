import { PERFIS } from '@ipe_crm/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { autenticacaoService } from '@/services/autenticacao.service';
import { LoginPage } from '@/features/autenticacao/LoginPage';

vi.mock('@/services/autenticacao.service', () => ({
  autenticacaoService: {
    login: vi.fn(),
  },
}));

const loginMock = vi.mocked(autenticacaoService.login);

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renderiza campos de email e senha', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('exibe erro ao submeter formulario vazio', async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/informe um email valido/i)).toBeInTheDocument();
    expect(screen.getByText(/senha deve ter no minimo/i)).toBeInTheDocument();
  });

  it('exibe erro com email invalido', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'email-invalido');
    await userEvent.type(screen.getByLabelText(/senha/i), 'Admin@1234');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/informe um email valido/i)).toBeInTheDocument();
  });

  it('exibe erro com senha menor que 8 caracteres', async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@ipecrm.com');
    await userEvent.type(screen.getByLabelText(/senha/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/senha deve ter no minimo/i)).toBeInTheDocument();
  });

  it('chama o servico com os dados corretos ao submeter', async () => {
    loginMock.mockResolvedValue({
      access_token: 'token-teste',
      usuario: {
        id: 'usuario-1',
        nome: 'Admin',
        email: 'admin@ipecrm.com',
        perfil: PERFIS.ADMIN,
      },
    });
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@ipecrm.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'Admin@1234');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('admin@ipecrm.com', 'Admin@1234');
    });
  });

  it('exibe mensagem de erro quando a API retorna 401', async () => {
    loginMock.mockRejectedValue(
      new AxiosError('Unauthorized', undefined, undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
        data: {},
      }),
    );
    renderLoginPage();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@ipecrm.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'senhaerrada');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/email ou senha invalidos/i)).toBeInTheDocument();
  });
});
