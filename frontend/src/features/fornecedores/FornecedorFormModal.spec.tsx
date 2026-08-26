import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FornecedorFormModal } from './FornecedorFormModal';

describe('FornecedorFormModal', () => {
  it('limita CNPJ a 14 digitos numericos', async () => {
    render(<FornecedorFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/cnpj/i), '12.345.678/0001-9999');

    expect(screen.getByLabelText(/cnpj/i)).toHaveValue('12345678000199');
  });

  it('formata telefone com DDD e limita a 11 digitos', async () => {
    render(<FornecedorFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/telefone/i), '11987654321999');

    expect(screen.getByLabelText(/telefone/i)).toHaveValue('(11) 98765-4321');
  });

  it('envia telefone formatado ao salvar', async () => {
    const onSalvar = vi.fn();
    render(<FornecedorFormModal aberto onFechar={vi.fn()} onSalvar={onSalvar} />);

    await userEvent.type(screen.getByLabelText(/razao social/i), 'Fornecedor Teste');
    await userEvent.type(screen.getByLabelText(/cnpj/i), '12345678000199');
    await userEvent.type(screen.getByLabelText(/telefone/i), '11987654321');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(onSalvar).toHaveBeenCalledWith(
        expect.objectContaining({
          cnpj: '12345678000199',
          telefone: '(11) 98765-4321',
        }),
        expect.anything(),
      );
    });
  });
});
