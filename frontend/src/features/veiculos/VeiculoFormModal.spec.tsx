import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VeiculoFormModal } from './VeiculoFormModal';

describe('VeiculoFormModal', () => {
  it('normaliza e limita a placa a 7 caracteres', async () => {
    render(<VeiculoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    const placa = screen.getByLabelText(/placa/i);
    await userEvent.type(placa, 'abc-1@23456');

    expect(placa).toHaveValue('ABC1234');
    expect(placa).toHaveAttribute('maxlength', '7');
  });

  it('aceita somente números no ano e não usa seletor numérico', async () => {
    render(<VeiculoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    const ano = screen.getByLabelText(/ano/i);
    await userEvent.type(ano, '20a2b6');

    expect(ano).toHaveValue('2026');
    expect(ano).toHaveAttribute('type', 'text');
    expect(ano).toHaveAttribute('inputmode', 'numeric');
  });

  it('limita modelo e marca a 20 caracteres', () => {
    render(<VeiculoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(screen.getByLabelText(/modelo/i)).toHaveAttribute('maxlength', '20');
    expect(screen.getByLabelText(/marca/i)).toHaveAttribute('maxlength', '20');
  });
});
