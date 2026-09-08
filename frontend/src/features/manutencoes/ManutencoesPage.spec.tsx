import { PERFIS } from '@ipe_crm/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { ManutencoesPage } from './ManutencoesPage';

vi.mock('./ManutencaoFormModal', () => ({
  ManutencaoFormModal: vi.fn(() => null),
}));

vi.mock('./hooks/useManutencoes', () => ({
  useManutencoes: vi.fn(() => ({
    data: {
      dados: [
        {
          id: 'manutencao-1',
          veiculo_id: 'veiculo-1',
          placa: 'ABC1234',
          data_manutencao: '2026-09-01',
          descricao: 'Troca de óleo',
          quilometragem: 290000,
          custo_mao_obra: 50,
          custo_total: 245,
          observacoes: null,
          usuario_id: 'usuario-1',
          usuario_nome: 'Admin',
          pecas: [],
          criado_em: '2026-09-01T00:00:00.000Z',
          atualizado_em: '2026-09-01T00:00:00.000Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
    },
    isLoading: false,
  })),
  useCriarManutencao: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false, error: null })),
  useAtualizarManutencao: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false, error: null })),
  useRemoverManutencao: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('ManutencoesPage', () => {
  function renderizar() {
    return render(
      <MemoryRouter initialEntries={['/manutencoes']}>
        <Routes>
          <Route path="/manutencoes" element={<ManutencoesPage />} />
          <Route path="/manutencoes/nova" element={<h1>Nova manutencao page</h1>} />
        </Routes>
      </MemoryRouter>,
    );
  }

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

  it('exibe ações por ícones acessíveis e centralizados', () => {
    renderizar();

    const editar = screen.getByRole('button', { name: /editar manutenção/i });
    const excluir = screen.getByRole('button', { name: /excluir manutenção/i });
    const cabecalhoAcoes = screen.getByRole('columnheader', { name: /ações/i });

    expect(editar).toContainElement(editar.querySelector('svg'));
    expect(excluir).toContainElement(excluir.querySelector('svg'));
    expect(cabecalhoAcoes).toHaveClass('text-center');
    expect(editar.parentElement).toHaveClass('justify-center', 'flex-nowrap');
  });
  it('direciona para a pagina de nova manutencao', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: /nova manuten/i }));

    expect(screen.getByRole('heading', { name: /nova manutencao page/i })).toBeInTheDocument();
  });

  it('abre os detalhes da manutencao ao clicar na placa', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'ABC1234' }));

    expect(screen.getByRole('heading', { name: /ABC1234/i })).toBeInTheDocument();
    expect(screen.getAllByText(/troca/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /fechar detalhes/i })).toBeInTheDocument();
  });
});
