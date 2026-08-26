import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemEstoqueFormModal, itemEstoqueFormSchema } from './ItemEstoqueFormModal';

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

  it('configura saldo inicial como numero inteiro nao negativo', () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(screen.getByLabelText(/saldo inicial/i)).toHaveAttribute('step', '1');
    expect(screen.getByLabelText(/saldo inicial/i)).toHaveAttribute('min', '0');
  });

  it('valida saldo inicial inteiro no schema', () => {
    const resultado = itemEstoqueFormSchema.safeParse({
      codigo: '01',
      descricao: 'Filtro',
      marca: '',
      categoria: 'filtro',
      unidade_medida: 'un',
      saldo_inicial: 1.5,
      estoque_minimo: 0,
      ativo: true,
      observacoes: '',
    });

    expect(resultado.success).toBe(false);
  });

  it('configura estoque minimo como numero inteiro nao negativo', () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(screen.getByLabelText(/estoque minimo/i)).toHaveAttribute('step', '1');
    expect(screen.getByLabelText(/estoque minimo/i)).toHaveAttribute('min', '0');
  });

  it('exibe codigo sugerido ao cadastrar item', () => {
    render(
      <ItemEstoqueFormModal aberto codigoSugerido="01" onFechar={vi.fn()} onSalvar={vi.fn()} />,
    );

    expect(screen.getByLabelText(/codigo/i)).toHaveValue('01');
    expect(screen.getByLabelText(/codigo/i)).toHaveAttribute('readonly');
  });

  it('exibe categorias em letras maiusculas', () => {
    render(<ItemEstoqueFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'FILTRO' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PECA' })).toBeInTheDocument();
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
