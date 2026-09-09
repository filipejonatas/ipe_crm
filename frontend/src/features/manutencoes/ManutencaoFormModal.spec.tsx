import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  it('carrega peças existentes e permite adicionar uma peça ao editar', async () => {
    const onSalvar = vi.fn();
    render(
      <ManutencaoFormModal
        aberto
        onFechar={vi.fn()}
        onSalvar={onSalvar}
        manutencao={
          {
            veiculo_id: '',
            data_manutencao: '2026-09-09',
            descricao: 'Revisão',
            custo_mao_obra: 20,
            pecas: [
              {
                id: 'p1',
                item_estoque_id: 'i1',
                descricao_peca: 'Filtro existente',
                quantidade: 2,
                preco_unitario: 5,
              },
            ],
          } as never
        }
      />,
    );
    const veiculo = screen.getByLabelText(/^veículo/i);
    const option = document.createElement('option');
    option.value = 'v1';
    option.textContent = 'ABC1234';
    veiculo.appendChild(option);
    await userEvent.selectOptions(veiculo, 'v1');
    expect(screen.getByLabelText(/descrição da peça/i)).toHaveValue('Filtro existente');
    expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /adicionar peça/i }));
    await userEvent.click(screen.getByRole('button', { name: /^peça avulsa/i }));
    const descricoes = screen.getAllByLabelText(/descrição da peça/i);
    await userEvent.type(descricoes[descricoes.length - 1], 'Arruela nova');
    const quantidades = screen.getAllByLabelText(/quantidade/i);
    await userEvent.type(quantidades[quantidades.length - 1], '1');
    await userEvent.click(screen.getByRole('button', { name: /adicionar peça avulsa/i }));
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() =>
      expect(onSalvar).toHaveBeenCalledWith(
        expect.objectContaining({
          pecas: [
            expect.objectContaining({ item_estoque_id: 'i1', quantidade: 2, preco_unitario: 5 }),
            expect.objectContaining({ descricao_peca: 'Arruela nova', quantidade: 1 }),
          ],
        }),
      ),
    );
    await userEvent.click(screen.getAllByRole('button', { name: /remover peça/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() =>
      expect(onSalvar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pecas: [expect.objectContaining({ descricao_peca: 'Arruela nova' })],
        }),
      ),
    );
  });

  it('exige a próxima data ao marcar troca de óleo e envia o prazo informado', async () => {
    const onSalvar = vi.fn();
    render(
      <ManutencaoFormModal
        aberto
        onFechar={vi.fn()}
        onSalvar={onSalvar}
        manutencao={
          {
            veiculo_id: '',
            data_manutencao: '2026-09-09',
            descricao: 'Troca',
            custo_mao_obra: 0,
          } as never
        }
      />,
    );
    const veiculo = screen.getByLabelText(/^veículo/i);
    const option = document.createElement('option');
    option.value = 'v1';
    option.textContent = 'ABC1234';
    veiculo.appendChild(option);
    await userEvent.selectOptions(veiculo, 'v1');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Troca de óleo' }));
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(await screen.findByText(/Informe uma data de próxima troca/)).toBeInTheDocument();
    expect(onSalvar).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Data da próxima troca de óleo/), {
      target: { value: '2027-03-09' },
    });
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() =>
      expect(onSalvar).toHaveBeenCalledWith(
        expect.objectContaining({
          troca_oleo: true,
          proxima_troca_oleo: '2027-03-09',
          proxima_troca_oleo_km: null,
        }),
      ),
    );
    await userEvent.type(screen.getByLabelText(/Próxima quilometragem/), '60000');
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() =>
      expect(onSalvar).toHaveBeenLastCalledWith(
        expect.objectContaining({ proxima_troca_oleo_km: 60000 }),
      ),
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Troca de óleo' }));
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() =>
      expect(onSalvar).toHaveBeenLastCalledWith(
        expect.objectContaining({ troca_oleo: false, proxima_troca_oleo_km: null }),
      ),
    );
  });

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
    await userEvent.click(screen.getByRole('button', { name: /^peça avulsa/i }));
    await userEvent.type(screen.getByLabelText(/descrição da peça/i), 'Arruela avulsa');
    await userEvent.type(screen.getByLabelText(/quantidade/i), '1');
    await userEvent.click(screen.getByRole('button', { name: /adicionar peça avulsa/i }));

    expect(screen.getByLabelText(/item de estoque/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição da peça/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço unitário/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remover peça/i })).toBeInTheDocument();
  });

  it('aceita quantidade inteira ou com somente uma casa decimal', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar peça/i }));
    await userEvent.click(screen.getByRole('button', { name: /^peça avulsa/i }));
    await userEvent.type(screen.getByLabelText(/descrição da peça/i), 'Arruela avulsa');
    await userEvent.type(screen.getByLabelText(/quantidade/i), '1');
    await userEvent.click(screen.getByRole('button', { name: /adicionar peça avulsa/i }));
    const quantidade = screen.getByLabelText(/quantidade/i);

    await userEvent.clear(quantidade);

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
    await userEvent.click(screen.getByRole('button', { name: /^peça avulsa/i }));
    await userEvent.type(screen.getByLabelText(/descrição da peça/i), 'Arruela avulsa');
    await userEvent.type(screen.getByLabelText(/quantidade/i), '2');
    await userEvent.type(screen.getByLabelText(/preço unitário/i), '10');
    await userEvent.click(screen.getByRole('button', { name: /adicionar peça avulsa/i }));
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

  it('abre o seletor e filtra somente itens com saldo disponivel', async () => {
    render(<ManutencaoFormModal aberto onFechar={vi.fn()} onSalvar={vi.fn()} />);

    expect(useItensEstoqueMock).toHaveBeenLastCalledWith({
      ativo: true,
      busca: undefined,
      categoria: undefined,
      com_saldo: true,
      limite: 10,
      pagina: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: /adicionar pe.a/i }));
    expect(screen.getByRole('dialog', { name: /selecionar pe.a/i })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/buscar pe.a no estoque/i), 'filtro');
    await userEvent.selectOptions(screen.getByLabelText(/filtrar por categoria/i), 'filtro');

    expect(useItensEstoqueMock).toHaveBeenLastCalledWith({
      ativo: true,
      busca: 'filtro',
      categoria: 'filtro',
      com_saldo: true,
      limite: 10,
      pagina: 1,
    });
  });
});
