import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
