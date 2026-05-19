import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrarAjusteModal } from './RegistrarAjusteModal';

const item = {
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
} as const;

describe('RegistrarAjusteModal', () => {
  it('valida novo saldo negativo', async () => {
    render(<RegistrarAjusteModal aberto item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText(/novo saldo/i));
    await userEvent.type(screen.getByLabelText(/novo saldo/i), '-1');
    await userEvent.click(screen.getByRole('button', { name: /ajustar/i }));
    expect(await screen.findByText(/novo saldo nao pode ser negativo/i)).toBeInTheDocument();
  });

  it('valida motivo obrigatorio', async () => {
    render(<RegistrarAjusteModal aberto item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /ajustar/i }));
    expect(await screen.findByText(/motivo deve ter pelo menos 5 caracteres/i)).toBeInTheDocument();
  });

  it('chama servico de ajuste com dados corretos', async () => {
    const salvar = vi.fn();
    render(<RegistrarAjusteModal aberto item={item} onFechar={vi.fn()} onSalvar={salvar} />);
    await userEvent.clear(screen.getByLabelText(/novo saldo/i));
    await userEvent.type(screen.getByLabelText(/novo saldo/i), '5');
    await userEvent.type(screen.getByLabelText(/motivo/i), 'Correcao de inventario');
    await userEvent.click(screen.getByRole('button', { name: /ajustar/i }));
    expect(salvar).toHaveBeenCalledWith({
      item_estoque_id: 'item-1',
      novo_saldo: 5,
      motivo: 'Correcao de inventario',
    });
  });
});
