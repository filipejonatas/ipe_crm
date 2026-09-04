import { PERFIS } from '@ipe_crm/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { VeiculosPage } from './VeiculosPage';
import { useCriarVeiculo, useVeiculos } from './hooks/useVeiculos';

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
    vi.mocked(useCriarVeiculo).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCriarVeiculo>);

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

  it('renderiza a tabela de veiculos com ano separado do modelo', () => {
    render(<VeiculosPage />);

    expect(screen.getByText('ABC1234')).toBeInTheDocument();
    expect(screen.getByText('Cargo')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('Cargo')).not.toHaveTextContent('2020');
  });

  it('exibe mensagem quando lista esta vazia', async () => {
    vi.mocked(useVeiculos).mockReturnValueOnce({
      data: { dados: [], total: 0, pagina: 1, limite: 10 },
      isLoading: false,
    } as unknown as ReturnType<typeof useVeiculos>);

    render(<VeiculosPage />);

    expect(screen.getByText(/nenhum ve.culo encontrado/i)).toBeInTheDocument();
  });

  it('abre modal ao clicar em novo veiculo', async () => {
    render(<VeiculosPage />);

    await userEvent.click(screen.getByRole('button', { name: /novo ve.culo/i }));

    expect(screen.getByRole('heading', { name: /novo ve.culo/i })).toBeInTheDocument();
  });

  it('lista veiculos em ordem alfabetica pelo campo selecionado', async () => {
    render(<VeiculosPage />);

    expect(useVeiculos).toHaveBeenCalledWith(
      expect.objectContaining({ ordenar_por: 'modelo', direcao: 'ASC' }),
    );

    await userEvent.selectOptions(screen.getByLabelText(/ordenar por/i), 'marca');

    expect(useVeiculos).toHaveBeenLastCalledWith(
      expect.objectContaining({ ordenar_por: 'marca', direcao: 'ASC' }),
    );
  });

  it('confirma quando um veiculo e cadastrado', async () => {
    vi.mocked(useCriarVeiculo).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        id: 'veiculo-2',
        placa: 'DEF5678',
        modelo: 'Sprinter',
        marca: 'Mercedes',
        ano: null,
        observacoes: null,
        ativo: true,
        criado_em: '2026-01-01T00:00:00.000Z',
        atualizado_em: '2026-01-01T00:00:00.000Z',
      }),
      isPending: false,
    } as unknown as ReturnType<typeof useCriarVeiculo>);

    render(<VeiculosPage />);

    await userEvent.click(screen.getByRole('button', { name: /novo ve.culo/i }));
    await userEvent.type(screen.getByLabelText(/^placa$/i), 'def5678');
    await userEvent.type(screen.getByLabelText(/^modelo$/i), 'Sprinter');
    await userEvent.type(screen.getByLabelText(/^marca$/i), 'Mercedes');
    await userEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Veículo DEF5678 cadastrado com sucesso.',
      );
    });
  });

  it('avisa quando a placa do veiculo ja existe', async () => {
    vi.mocked(useCriarVeiculo).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 409, data: { message: 'Placa ja cadastrada' } },
      }),
      isPending: false,
    } as unknown as ReturnType<typeof useCriarVeiculo>);

    render(<VeiculosPage />);

    await userEvent.click(screen.getByRole('button', { name: /novo ve.culo/i }));
    await userEvent.type(screen.getByLabelText(/^placa$/i), 'abc1234');
    await userEvent.type(screen.getByLabelText(/^modelo$/i), 'Cargo');
    await userEvent.type(screen.getByLabelText(/^marca$/i), 'Ford');
    await userEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Veículo já cadastrado. Confira a placa informada.',
      );
    });
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

    expect(screen.queryByRole('button', { name: /novo ve.culo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });
});
