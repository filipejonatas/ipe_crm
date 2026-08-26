import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useItensEstoque } from '@/features/estoque/hooks/useItensEstoque';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import type {
  CriarManutencaoVeiculoDto,
  ManutencaoVeiculo,
  PecaManutencaoDto,
} from '@/services/manutencoes.service';

interface ManutencaoFormValues {
  veiculo_id: string;
  data_manutencao: string;
  descricao: string;
  quilometragem: number | '';
  custo_mao_obra: number | '';
  observacoes: string;
}

interface PecaFormValues {
  item_estoque_id: string;
  descricao_peca: string;
  quantidade: number | '';
  preco_unitario: number | '';
}

interface Props {
  aberto: boolean;
  manutencao?: ManutencaoVeiculo | null;
  salvando?: boolean;
  erro?: unknown;
  onFechar: () => void;
  onSalvar: (dto: CriarManutencaoVeiculoDto) => Promise<unknown> | void;
}

const hoje = () => new Date().toISOString().slice(0, 10);

const pecaVazia: PecaFormValues = {
  item_estoque_id: '',
  descricao_peca: '',
  quantidade: '',
  preco_unitario: '',
};

export function ManutencaoFormModal({
  aberto,
  manutencao,
  salvando,
  erro,
  onFechar,
  onSalvar,
}: Props) {
  const [pecas, setPecas] = useState<PecaFormValues[]>([]);
  const [erroLocal, setErroLocal] = useState('');
  const { data: veiculos } = useVeiculos({ ativo: true, limite: 100 });
  const { data: itens } = useItensEstoque({ ativo: true, limite: 100 });
  const editando = Boolean(manutencao);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManutencaoFormValues>({
    defaultValues: {
      veiculo_id: '',
      data_manutencao: hoje(),
      descricao: '',
      quilometragem: '',
      custo_mao_obra: 0,
      observacoes: '',
    },
  });

  useEffect(() => {
    reset(
      manutencao
        ? {
            veiculo_id: manutencao.veiculo_id,
            data_manutencao: manutencao.data_manutencao,
            descricao: manutencao.descricao,
            quilometragem: manutencao.quilometragem ?? '',
            custo_mao_obra: manutencao.custo_mao_obra,
            observacoes: manutencao.observacoes ?? '',
          }
        : {
            veiculo_id: '',
            data_manutencao: hoje(),
            descricao: '',
            quilometragem: '',
            custo_mao_obra: 0,
            observacoes: '',
          },
    );
    setPecas([]);
    setErroLocal('');
  }, [aberto, manutencao, reset]);

  const totalPecas = useMemo(
    () =>
      pecas.reduce((total, peca) => {
        const quantidade = Number(peca.quantidade || 0);
        const preco = Number(peca.preco_unitario || 0);
        return total + quantidade * preco;
      }, 0),
    [pecas],
  );

  if (!aberto) return null;

  function atualizarPeca(indice: number, campo: keyof PecaFormValues, valor: string) {
    setPecas((atuais) =>
      atuais.map((peca, posicao) => (posicao === indice ? { ...peca, [campo]: valor } : peca)),
    );
  }

  function removerPeca(indice: number) {
    setPecas((atuais) => atuais.filter((_peca, posicao) => posicao !== indice));
  }

  async function salvar(valores: ManutencaoFormValues) {
    setErroLocal('');

    const custoMaoObra = Number(valores.custo_mao_obra || 0);
    const quilometragem = valores.quilometragem === '' ? null : Number(valores.quilometragem);
    const pecasDto: PecaManutencaoDto[] = [];

    for (const peca of pecas) {
      const quantidade = Number(peca.quantidade);
      const precoUnitario = Number(peca.preco_unitario || 0);
      const temItem = Boolean(peca.item_estoque_id);
      const descricao = peca.descricao_peca.trim();

      if (!temItem && !descricao) {
        setErroLocal('Informe a peca avulsa ou selecione um item de estoque.');
        return;
      }
      if (!quantidade || quantidade <= 0) {
        setErroLocal('Quantidade da peca deve ser maior que zero.');
        return;
      }
      if (precoUnitario < 0) {
        setErroLocal('Preco da peca nao pode ser negativo.');
        return;
      }

      pecasDto.push({
        item_estoque_id: peca.item_estoque_id || undefined,
        descricao_peca: descricao || undefined,
        quantidade,
        preco_unitario: precoUnitario,
      });
    }

    try {
      await onSalvar({
        veiculo_id: valores.veiculo_id,
        data_manutencao: valores.data_manutencao,
        descricao: valores.descricao,
        quilometragem,
        custo_mao_obra: custoMaoObra,
        observacoes: valores.observacoes || null,
        pecas: editando ? undefined : pecasDto,
      });
    } catch (error) {
      const mensagem =
        error instanceof AxiosError
          ? ((error.response?.data as { message?: string; mensagem?: string })?.message ??
            (error.response?.data as { mensagem?: string })?.mensagem)
          : undefined;
      setErroLocal(mensagem ?? 'Nao foi possivel salvar a manutencao.');
    }
  }

  const erroServidor =
    erro instanceof AxiosError
      ? ((erro.response?.data as { message?: string; mensagem?: string })?.message ??
        (erro.response?.data as { mensagem?: string })?.mensagem)
      : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950">
            {editando ? 'Editar manutencao' : 'Nova manutencao'}
          </h2>
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit(salvar)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-zinc-700">Veiculo</span>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                {...register('veiculo_id', { required: 'Veiculo e obrigatorio' })}
              >
                <option value="">Selecione</option>
                {veiculos?.dados.map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.placa} - {veiculo.modelo}
                  </option>
                ))}
              </select>
              {errors.veiculo_id && (
                <span className="text-xs text-red-600">{errors.veiculo_id.message}</span>
              )}
            </label>

            <label>
              <span className="text-sm font-medium text-zinc-700">Data</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                type="date"
                {...register('data_manutencao', { required: 'Data e obrigatoria' })}
              />
              {errors.data_manutencao && (
                <span className="text-xs text-red-600">{errors.data_manutencao.message}</span>
              )}
            </label>

            <label>
              <span className="text-sm font-medium text-zinc-700">Quilometragem</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                min="0"
                type="number"
                {...register('quilometragem')}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-zinc-700">Mao de obra</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                min="0"
                step="0.01"
                type="number"
                {...register('custo_mao_obra')}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Manutencao feita</span>
              <textarea
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                rows={3}
                {...register('descricao', { required: 'Descricao e obrigatoria' })}
              />
              {errors.descricao && (
                <span className="text-xs text-red-600">{errors.descricao.message}</span>
              )}
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Observacoes</span>
              <textarea
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                rows={2}
                {...register('observacoes')}
              />
            </label>
          </div>

          {!editando && (
            <div className="space-y-3 border-t border-zinc-200 pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase text-zinc-500">Pecas</h3>
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium"
                  onClick={() => setPecas((atuais) => [...atuais, { ...pecaVazia }])}
                  type="button"
                >
                  Adicionar peca
                </button>
              </div>

              {pecas.length === 0 && (
                <p className="rounded-md bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
                  Nenhuma peca inclusa.
                </p>
              )}

              {pecas.map((peca, indice) => (
                <div
                  className="grid gap-3 rounded-md border border-zinc-200 p-3 lg:grid-cols-[1fr_1fr_120px_140px_80px]"
                  key={indice}
                >
                  <select
                    aria-label="Item de estoque"
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    value={peca.item_estoque_id}
                    onChange={(event) =>
                      atualizarPeca(indice, 'item_estoque_id', event.target.value)
                    }
                  >
                    <option value="">Peca avulsa</option>
                    {itens?.dados.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.descricao} ({item.saldo_atual} {item.unidade_medida})
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Descricao da peca"
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    placeholder="Descricao da peca"
                    value={peca.descricao_peca}
                    onChange={(event) =>
                      atualizarPeca(indice, 'descricao_peca', event.target.value)
                    }
                  />
                  <input
                    aria-label="Quantidade"
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    min="0.001"
                    step="0.001"
                    type="number"
                    value={peca.quantidade}
                    onChange={(event) => atualizarPeca(indice, 'quantidade', event.target.value)}
                  />
                  <input
                    aria-label="Preco unitario"
                    className="rounded-md border border-zinc-300 px-3 py-2"
                    min="0"
                    step="0.01"
                    type="number"
                    value={peca.preco_unitario}
                    onChange={(event) =>
                      atualizarPeca(indice, 'preco_unitario', event.target.value)
                    }
                  />
                  <button
                    className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                    onClick={() => removerPeca(indice)}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              ))}

              <p className="text-right text-sm font-medium text-zinc-700">
                Total em pecas: {formatarMoeda(totalPecas)}
              </p>
            </div>
          )}

          {(erroLocal || erroServidor) && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroLocal || erroServidor}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium"
              onClick={onFechar}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={salvando}
              type="submit"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
