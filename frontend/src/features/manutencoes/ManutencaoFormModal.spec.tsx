import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useItensEstoque } from '@/features/estoque/hooks/useItensEstoque';
import { ManutencaoFormModal } from './ManutencaoFormModal';

vi.mock('@/features/estoque/hooks/useItensEstoque', () => ({
  useItensEstoque: vi.fn(() => ({ data: { dados: [] } })),
}));

vi.mock('@/features/veiculos/hooks/useVeiculos', () => ({
  useVeiculos: vi.fn(() => ({ data: { dados: [] } })),
}));

const useItensEstoqueMock = vi.mocked(useItensEstoque);

describe('ManutencaoFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aceita somente números e limita a quilometragem a 8 dígitos', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    const quilometragem = screen.getByLabelText(/quilometragem/i);
    await userEvent.type(quilometragem, '12a34567890');

    expect(quilometragem).toHaveValue('12345678');
    expect(quilometragem).toHaveAttribute('maxlength', '8');
    expect(quilometragem).toHaveAttribute('inputmode', 'numeric');
    expect(quilometragem).toHaveAttribute('type', 'text');
  });

  it('mostra legendas nas peças e usa ícone acessível para remover', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar peça/i }));

    expect(screen.getByLabelText(/item de estoque/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição da peça/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço unitário/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover peça/i })).toBeInTheDocument();
  });

  it('aceita quantidade inteira ou com somente uma casa decimal', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar peça/i }));
    const quantidade = screen.getByLabelText(/quantidade/i);

    await userEvent.type(quantidade, '2.55');

    expect(quantidade).toHaveValue('2.5');
    expect(quantidade).toHaveAttribute('inputmode', 'decimal');
  });

  it('posiciona mão de obra depois da seção de peças', () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    const pecas = screen.getByRole('heading', { name: /peças/i });
    const maoDeObra = screen.getByLabelText(/mão de obra/i);

    expect(pecas.compareDocumentPosition(maoDeObra)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('exibe mão de obra antes dos totais e calcula peças mais mão de obra', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar peça/i }));
    await userEvent.type(screen.getByLabelText(/quantidade/i), '2');
    await userEvent.type(screen.getByLabelText(/preço unitário/i), '10');
    await userEvent.clear(screen.getByLabelText(/mão de obra/i));
    await userEvent.type(screen.getByLabelText(/mão de obra/i), '5');

    const maoDeObra = screen.getByLabelText(/mão de obra/i);
    const totalPecas = screen.getByText('Total das peças');
    const totalGeral = screen.getByText(/total geral.*peças.*mão de obra/i);

    expect(maoDeObra.compareDocumentPosition(totalPecas)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(totalPecas.compareDocumentPosition(totalGeral)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument();
  });

  it('busca itens de estoque com limite aceito pelo backend', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(useItensEstoqueMock).toHaveBeenLastCalledWith({
      ativo: true,
      busca: undefined,
      limite: 10,
    });

    await userEvent.type(screen.getByLabelText(/buscar peca no estoque/i), 'filtro');

    expect(useItensEstoqueMock).toHaveBeenLastCalledWith({
      ativo: true,
      busca: 'filtro',
      limite: 10,
    });
  });
});
