import { PERFIS } from '@ipe_crm/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { VeiculosPage } from './VeiculosPage';

vi.mock('./hooks/useVeiculos', () => ({
  useVeiculos: vi.fn(() => ({
    data: {
      dados: [
        {
          id: 'veiculo-1',
          placa: 'ABC1234',
          modelo: 'Cargo',
          marca: 'Ford',
          ano: 2020,
          observacoes: null,
          ativo: true,
          criado_em: '2026-01-01T00:00:00.000Z',
          atualizado_em: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
    },
    isLoading: false,
  })),
  useCriarVeiculo: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useAtualizarVeiculo: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useRemoverVeiculo: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('VeiculosPage', () => {
  beforeEach(() => {
    useAutenticacaoStore.setState({
      autenticado: true,
      token: 'token-teste',
      usuario: {
        id: 'usuario-1',
        nome: 'Admin',
        email: 'admin@ipecrm.com',
        perfil: PERFIS.ADMIN,
      },
    });
  });

  it('renderiza a tabela de veiculos', () => {
    render(<VeiculosPage />);

    expect(screen.getByText('ABC1234')).toBeInTheDocument();
    expect(screen.getByText(/cargo/i)).toBeInTheDocument();
  });

  it('exibe mensagem quando lista esta vazia', async () => {
    const hooks = await import('./hooks/useVeiculos');
    vi.mocked(hooks.useVeiculos).mockReturnValueOnce({
      data: { dados: [], total: 0, pagina: 1, limite: 10 },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useVeiculos>);

    render(<VeiculosPage />);

    expect(screen.getByText(/nenhum veiculo encontrado/i)).toBeInTheDocument();
  });

  it('abre modal ao clicar em Novo Veiculo', async () => {
    render(<VeiculosPage />);

    await userEvent.click(screen.getByRole('button', { name: /novo veiculo/i }));

    expect(screen.getByRole('heading', { name: /novo veiculo/i })).toBeInTheDocument();
  });

  it('oculta acoes de escrita para perfil oficina', () => {
    useAutenticacaoStore.setState({
      usuario: {
        id: 'usuario-2',
        nome: 'Oficina',
        email: 'oficina@ipecrm.com',
        perfil: PERFIS.OFICINA,
      },
    });

    render(<VeiculosPage />);

    expect(screen.queryByRole('button', { name: /novo veiculo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });
});
