import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemEstoqueFormModal } from './ItemEstoqueFormModal';

describe('ItemEstoqueFormModal', () => {
  it('valida descricao obrigatoria', async () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText(/descricao/i));
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(await screen.findByText(/descricao e obrigatoria/i)).toBeInTheDocument();
  });

  it('valida categoria obrigatoria', async () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(/categoria/i), '');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(await screen.findByText(/categoria e obrigatoria/i)).toBeInTheDocument();
  });

  it('valida saldo inicial negativo', async () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText(/saldo inicial/i));
    await userEvent.type(screen.getByLabelText(/saldo inicial/i), '-1');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(await screen.findByText(/saldo inicial nao pode ser negativo/i)).toBeInTheDocument();
  });

  it('nao exibe campo saldo inicial na edicao', () => {
    render(
      <ItemEstoqueFormModal
        aberto
        item={{
          id: 'item-1',
          codigo: null,
          descricao: 'Filtro',
          marca: null,
          categoria: 'filtro',
          unidade_medida: 'un',
          saldo_atual: 1,
          estoque_minimo: 1,
          ativo: true,
          observacoes: null,
          criado_em: '',
          atualizado_em: '',
        }}
        onFechar={vi.fn()}
        onSalvar={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(/saldo inicial/i)).not.toBeInTheDocument();
  });
});
