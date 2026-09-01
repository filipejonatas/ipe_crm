import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BotaoFecharModal } from '@/components/BotaoFecharModal';
import { IconeAcao } from '@/components/IconeAcao';
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
    watch,
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
  const campoQuilometragem = register('quilometragem');

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
  const custoMaoObra = Number(watch('custo_mao_obra') || 0);
  const totalManutencao = totalPecas + custoMaoObra;

  if (!aberto) return null;

  function atualizarPeca(indice: number, campo: keyof PecaFormValues, valor: string) {
    setPecas((atuais) =>
      atuais.map((peca, posicao) => (posicao === indice ? { ...peca, [campo]: valor } : peca)),
    );
  }

  function normalizarQuantidade(valor: string) {
    const partes = valor
      .replace(',', '.')
      .replace(/[^\d.]/g, '')
      .split('.');
    const inteiro = partes.shift() ?? '';
    const decimal = partes.join('').slice(0, 1);

    return partes.length > 0 || valor.includes('.') || valor.includes(',')
      ? `${inteiro}.${decimal}`
      : inteiro;
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
        setErroLocal('Informe a peça avulsa ou selecione um item de estoque.');
        return;
      }
      if (!quantidade || quantidade <= 0) {
        setErroLocal('Quantidade da peça deve ser maior que zero.');
        return;
      }
      if (precoUnitario < 0) {
        setErroLocal('Preço da peça não pode ser negativo.');
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
      setErroLocal(mensagem ?? 'Não foi possível salvar a manutenção.');
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
            {editando ? 'Editar manutenção' : 'Nova manutenção'}
          </h2>
          <BotaoFecharModal onClick={onFechar} />
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit(salvar)}>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="text-sm font-medium text-zinc-700">Veículo</span>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                {...register('veiculo_id', { required: 'Veículo é obrigatório' })}
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
                {...register('data_manutencao', { required: 'Data é obrigatória' })}
              />
              {errors.data_manutencao && (
                <span className="text-xs text-red-600">{errors.data_manutencao.message}</span>
              )}
            </label>

            <label>
              <span className="text-sm font-medium text-zinc-700">Quilometragem</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                inputMode="numeric"
                maxLength={8}
                pattern="[0-9]*"
                type="text"
                {...campoQuilometragem}
                onChange={(event) => {
                  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 8);
                  void campoQuilometragem.onChange(event);
                }}
              />
            </label>

            <label className="md:col-span-3">
              <span className="text-sm font-medium text-zinc-700">Manutenção feita</span>
              <textarea
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                rows={3}
                {...register('descricao', { required: 'Descrição é obrigatória' })}
              />
              {errors.descricao && (
                <span className="text-xs text-red-600">{errors.descricao.message}</span>
              )}
            </label>

            <label className="md:col-span-3">
              <span className="text-sm font-medium text-zinc-700">Observações</span>
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
                <h3 className="text-sm font-semibold uppercase text-zinc-500">Peças</h3>
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium"
                  onClick={() => setPecas((atuais) => [...atuais, { ...pecaVazia }])}
                  type="button"
                >
                  Adicionar peça
                </button>
              </div>

              {pecas.length === 0 && (
                <p className="rounded-md bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
                  Nenhuma peça incluída.
                </p>
              )}

              {pecas.map((peca, indice) => (
                <div
                  className="grid items-end gap-3 rounded-md border border-zinc-200 p-3 sm:grid-cols-2 xl:grid-cols-12"
                  key={indice}
                >
                  <label className="xl:col-span-4">
                    <span className="text-xs font-medium text-zinc-600">Item de estoque</span>
                    <select
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                      value={peca.item_estoque_id}
                      onChange={(event) =>
                        atualizarPeca(indice, 'item_estoque_id', event.target.value)
                      }
                    >
                      <option value="">Peça avulsa</option>
                      {itens?.dados.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.descricao} ({item.saldo_atual} {item.unidade_medida})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="xl:col-span-3">
                    <span className="text-xs font-medium text-zinc-600">Descrição da peça</span>
                    <input
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                      value={peca.descricao_peca}
                      onChange={(event) =>
                        atualizarPeca(indice, 'descricao_peca', event.target.value)
                      }
                    />
                  </label>
                  <label className="xl:col-span-2">
                    <span className="text-xs font-medium text-zinc-600">Quantidade</span>
                    <input
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                      inputMode="decimal"
                      pattern="[0-9]+([.,][0-9])?"
                      type="text"
                      value={peca.quantidade}
                      onChange={(event) =>
                        atualizarPeca(
                          indice,
                          'quantidade',
                          normalizarQuantidade(event.target.value),
                        )
                      }
                    />
                  </label>
                  <label className="xl:col-span-2">
                    <span className="text-xs font-medium text-zinc-600">Preço unitário (R$)</span>
                    <input
                      className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                      min="0"
                      step="0.01"
                      type="number"
                      value={peca.preco_unitario}
                      onChange={(event) =>
                        atualizarPeca(indice, 'preco_unitario', event.target.value)
                      }
                    />
                  </label>
                  <button
                    aria-label="Remover peça"
                    className="justify-self-start rounded-md border border-red-200 p-2.5 text-red-700 hover:bg-red-50 xl:col-span-1 xl:justify-self-center"
                    onClick={() => removerPeca(indice)}
                    title="Remover peça"
                    type="button"
                  >
                    <IconeAcao tipo="excluir" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-zinc-200 pt-5">
            <div className="grid items-end gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Mão de obra — valor unitário (R$)
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                  min="0"
                  step="0.01"
                  type="number"
                  {...register('custo_mao_obra')}
                />
              </label>

              <div>
                <span className="text-sm font-medium text-zinc-700">Total das peças</span>
                <output className="mt-1 flex w-full items-center rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 font-semibold text-zinc-800">
                  {formatarMoeda(totalPecas)}
                </output>
              </div>

              <div>
                <span className="text-sm font-medium text-zinc-700">
                  Total geral — peças + mão de obra
                </span>
                <output className="mt-1 flex w-full items-center rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 font-semibold text-emerald-900">
                  {formatarMoeda(totalManutencao)}
                </output>
              </div>
            </div>
          </div>

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
