import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PERFIS } from '@ipe_crm/shared';
import { EstoquePage } from './EstoquePage';

const estado = vi.hoisted(() => ({ perfil: 'admin', listaVazia: [] as unknown[] }));

vi.mock('@/store/autenticacao.store', () => ({
  useAutenticacaoStore: vi.fn((seletor) =>
    seletor({
      usuario: { id: 'usuario-1', nome: 'Teste', email: 'teste@ipecrm.com', perfil: estado.perfil },
      token: 'token',
      autenticado: true,
    }),
  ),
}));

vi.mock('./hooks/useItensEstoque', () => ({
  useItensEstoque: vi.fn(() => ({
    data: {
      dados: [
        {
          id: 'item-1',
          codigo: 'FIL-001',
          descricao: 'Filtro de oleo',
          marca: 'Tecfil',
          categoria: 'filtro',
          unidade_medida: 'un',
          saldo_atual: 1,
          estoque_minimo: 2,
          ativo: true,
          observacoes: null,
          criado_em: '2026-01-01T00:00:00.000Z',
          atualizado_em: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
      total_paginas: 1,
    },
    isLoading: false,
  })),
  useCriarItemEstoque: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve()),
    isPending: false,
  })),
  useAtualizarItemEstoque: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve()),
    isPending: false,
  })),
  useRemoverItemEstoque: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useVincularVeiculosItem: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve()),
    isPending: false,
  })),
  useVeiculosCompativeis: vi.fn(() => ({ data: estado.listaVazia })),
}));

vi.mock('./hooks/useMovimentacoesEstoque', () => ({
  useRegistrarSaidaEstoque: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve()),
    isPending: false,
  })),
  useRegistrarAjusteEstoque: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve()),
    isPending: false,
  })),
  useMovimentacoesDoItem: vi.fn(() => ({
    data: { dados: [], total: 0, pagina: 1, limite: 20 },
    isLoading: false,
  })),
}));

vi.mock('@/features/veiculos/hooks/useVeiculos', () => ({
  useVeiculos: vi.fn(() => ({
    data: { dados: estado.listaVazia, total: 0, pagina: 1, limite: 100 },
  })),
}));

function logar(perfil = PERFIS.ADMIN) {
  estado.perfil = perfil;
}

describe('EstoquePage', () => {
  beforeEach(() => logar(PERFIS.ADMIN));

  it('renderiza tabela de itens', () => {
    render(<EstoquePage />);
    expect(screen.getByText('FIL-001')).toBeInTheDocument();
    expect(screen.getByText('Filtro de oleo')).toBeInTheDocument();
  });

  it('exibe mensagem quando lista esta vazia', async () => {
    const hooks = await import('./hooks/useItensEstoque');
    vi.mocked(hooks.useItensEstoque).mockReturnValueOnce({
      data: { dados: [], total: 0, pagina: 1, limite: 10, total_paginas: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useItensEstoque>);

    render(<EstoquePage />);
    expect(screen.getByText(/nenhum item de estoque encontrado/i)).toBeInTheDocument();
  });

  it('destaca item com baixo estoque', () => {
    render(<EstoquePage />);
    expect(screen.getByText('Filtro de oleo').closest('tr')).toHaveClass('bg-amber-50');
  });

  it('oculta botao de ajuste para perfil oficina', () => {
    logar(PERFIS.OFICINA);
    render(<EstoquePage />);
    expect(screen.queryByRole('button', { name: /ajustar saldo/i })).not.toBeInTheDocument();
  });

  it('exibe botao de ajuste para perfil gerente', () => {
    logar(PERFIS.GERENTE);
    render(<EstoquePage />);
    expect(screen.getByRole('button', { name: /ajustar saldo/i })).toBeInTheDocument();
  });

  it('abre modal de novo item', async () => {
    render(<EstoquePage />);
    await userEvent.click(screen.getByRole('button', { name: /novo item/i }));
    expect(screen.getByRole('heading', { name: /novo item/i })).toBeInTheDocument();
  });

  it('abre modal de historico de utilizacao do filtro', async () => {
    render(<EstoquePage />);
    await userEvent.click(screen.getByRole('button', { name: /historico/i }));
    expect(screen.getByRole('heading', { name: /historico/i })).toBeInTheDocument();
  });
});
