import { PERFIS } from '@ipe_crm/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { FornecedoresPage } from './FornecedoresPage';

vi.mock('./hooks/useFornecedores', () => ({
  useFornecedores: vi.fn(() => ({
    data: {
      dados: [
        {
          id: 'fornecedor-1',
          razao_social: 'Fornecedor Teste',
          nome_fantasia: null,
          cnpj: '00.000.000/0001-00',
          telefone: null,
          email: 'fornecedor@teste.com',
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
  useCriarFornecedor: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useAtualizarFornecedor: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useRemoverFornecedor: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe('FornecedoresPage', () => {
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

  it('renderiza a tabela de fornecedores', () => {
    render(<FornecedoresPage />);

    expect(screen.getByText('Fornecedor Teste')).toBeInTheDocument();
    expect(screen.getByText('00.000.000/0001-00')).toBeInTheDocument();
  });

  it('exibe mensagem quando lista está vazia', async () => {
    const hooks = await import('./hooks/useFornecedores');
    vi.mocked(hooks.useFornecedores).mockReturnValueOnce({
      data: { dados: [], total: 0, pagina: 1, limite: 10 },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFornecedores>);

    render(<FornecedoresPage />);

    expect(screen.getByText(/nenhum fornecedor encontrado/i)).toBeInTheDocument();
  });

  it('abre modal ao clicar em Novo Fornecedor', async () => {
    render(<FornecedoresPage />);

    await userEvent.click(screen.getByRole('button', { name: /novo fornecedor/i }));

    expect(screen.getByRole('heading', { name: /novo fornecedor/i })).toBeInTheDocument();
  });

  it('oculta ações de escrita para perfil gerente', () => {
    useAutenticacaoStore.setState({
      usuario: {
        id: 'usuario-2',
        nome: 'Gerente',
        email: 'gerente@ipecrm.com',
        perfil: PERFIS.GERENTE,
      },
    });

    render(<FornecedoresPage />);

    expect(screen.queryByRole('button', { name: /novo fornecedor/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });

  it('permite compras criar e editar, mas não excluir', () => {
    useAutenticacaoStore.setState({
      usuario: {
        id: 'usuario-3',
        nome: 'Compras',
        email: 'compras@ipecrm.com',
        perfil: PERFIS.COMPRAS,
      },
    });

    render(<FornecedoresPage />);

    expect(screen.getByRole('button', { name: /novo fornecedor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });
});
