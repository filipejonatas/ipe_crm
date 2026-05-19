import { AxiosError } from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrarSaidaModal } from './RegistrarSaidaModal';

vi.mock('./hooks/useItensEstoque', () => ({ useVeiculosCompativeis: vi.fn(() => ({ data: [] })) }));
vi.mock('@/features/veiculos/hooks/useVeiculos', () => ({
  useVeiculos: vi.fn(() => ({
    data: {
      dados: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          placa: 'ABC1234',
          modelo: 'Cargo',
          marca: 'Ford',
          ano: 2020,
          observacoes: null,
          ativo: true,
          criado_em: '',
          atualizado_em: '',
        },
      ],
    },
  })),
}));

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

describe('RegistrarSaidaModal', () => {
  it('valida quantidade obrigatoria', async () => {
    render(<RegistrarSaidaModal aberto item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(await screen.findByText(/quantidade e obrigatoria/i)).toBeInTheDocument();
  });

  it('valida quantidade maior que zero', async () => {
    render(<RegistrarSaidaModal aberto item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/quantidade utilizada/i), '0');
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(await screen.findByText(/quantidade deve ser maior que zero/i)).toBeInTheDocument();
  });

  it('chama servico de saida com dados corretos', async () => {
    const salvar = vi.fn(() => Promise.resolve());
    render(<RegistrarSaidaModal aberto item={item} onFechar={vi.fn()} onSalvar={salvar} />);
    await userEvent.type(screen.getByLabelText(/quantidade utilizada/i), '2');
    await userEvent.selectOptions(
      screen.getByLabelText(/veiculo/i),
      '22222222-2222-4222-8222-222222222222',
    );
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        item_estoque_id: 'item-1',
        quantidade: 2,
        veiculo_id: '22222222-2222-4222-8222-222222222222',
      }),
    );
  });

  it('exige veiculo informado para saida de filtro', async () => {
    render(<RegistrarSaidaModal aberto item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/quantidade utilizada/i), '2');
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(await screen.findByText(/saida de filtro exige veiculo informado/i)).toBeInTheDocument();
  });

  it('exibe erro de saldo insuficiente', () => {
    const erro = new AxiosError('Saldo insuficiente', undefined, undefined, undefined, {
      data: { message: 'Saldo insuficiente' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    });
    render(
      <RegistrarSaidaModal aberto erro={erro} item={item} onFechar={vi.fn()} onSalvar={vi.fn()} />,
    );
    expect(screen.getByText(/saldo insuficiente/i)).toBeInTheDocument();
  });
});
