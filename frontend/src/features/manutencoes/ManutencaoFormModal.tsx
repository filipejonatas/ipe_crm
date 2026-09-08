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
import {
  categoriasItemEstoque,
  type CategoriaItemEstoque,
  type ItemEstoque,
} from '@/services/estoque.service';

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
  busca_item_estoque: string;
  descricao_peca: string;
  quantidade: number | '';
  preco_unitario: number | '';
}

interface Props {
  aberto: boolean;
  manutencao?: ManutencaoVeiculo | null;
  variante?: 'modal' | 'pagina';
  salvando?: boolean;
  erro?: unknown;
  onFechar: () => void;
  onSalvar: (dto: CriarManutencaoVeiculoDto) => Promise<unknown> | void;
}

const hoje = () => new Date().toISOString().slice(0, 10);

const pecaVazia: PecaFormValues = {
  item_estoque_id: '',
  busca_item_estoque: '',
  descricao_peca: '',
  quantidade: '',
  preco_unitario: '',
};

export function ManutencaoFormModal({
  aberto,
  manutencao,
  variante = 'modal',
  salvando,
  erro,
  onFechar,
  onSalvar,
}: Props) {
  const [pecas, setPecas] = useState<PecaFormValues[]>([]);
  const [seletorPecaAberto, setSeletorPecaAberto] = useState(false);
  const [indicePecaEmEdicao, setIndicePecaEmEdicao] = useState<number | null>(null);
  const [erroLocal, setErroLocal] = useState('');
  const { data: veiculos } = useVeiculos({ ativo: true, limite: 100 });
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
    setSeletorPecaAberto(false);
    setIndicePecaEmEdicao(null);
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
  const pagina = variante === 'pagina';

  if (!aberto && !pagina) return null;

  function atualizarPeca(indice: number, campo: keyof PecaFormValues, valor: string) {
    setPecas((atuais) =>
      atuais.map((peca, posicao) => (posicao === indice ? { ...peca, [campo]: valor } : peca)),
    );
  }

  function abrirSeletorPeca(indice: number | null = null) {
    setIndicePecaEmEdicao(indice);
    setSeletorPecaAberto(true);
  }

  function selecionarPeca(novaPeca: PecaFormValues) {
    setPecas((atuais) =>
      indicePecaEmEdicao === null
        ? [...atuais, novaPeca]
        : atuais.map((peca, indice) => (indice === indicePecaEmEdicao ? novaPeca : peca)),
    );
    setSeletorPecaAberto(false);
    setIndicePecaEmEdicao(null);
  }

  function removerPeca(indice: number) {
    setPecas((atuais) => atuais.filter((_peca, posicao) => posicao !== indice));
  }

  async function salvar(valores: ManutencaoFormValues) {
    setErroLocal('');

    const custoMaoObra = Number(valores.custo_mao_obra || 0);
    const quilometragem = valores.quilometragem === '' ? undefined : Number(valores.quilometragem);
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
    <div
      className={
        pagina
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4'
      }
    >
      <div
        className={
          pagina
            ? 'w-full rounded-md border border-zinc-200 bg-white p-6'
            : 'max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-md bg-white p-6 shadow-xl'
        }
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950">
            {editando ? 'Editar manutenção' : 'Nova manutenção'}
          </h2>
          {!pagina && <BotaoFecharModal onClick={onFechar} />}
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
                  onClick={() => abrirSeletorPeca()}
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
                  <div className="xl:col-span-4">
                    <span className="text-xs font-medium text-zinc-600">Item de estoque</span>
                    <div className="mt-1 flex gap-2">
                      <input
                        aria-label="Item de estoque"
                        className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm"
                        readOnly
                        value={peca.busca_item_estoque}
                      />
                      <button
                        className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                        onClick={() => abrirSeletorPeca(indice)}
                        type="button"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
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

      <SeletorPecaModal
        aberto={seletorPecaAberto}
        onFechar={() => setSeletorPecaAberto(false)}
        onSelecionarAvulsa={selecionarPeca}
        onSelecionarItem={(item) =>
          selecionarPeca({
            ...pecaVazia,
            item_estoque_id: item.id,
            busca_item_estoque: formatarItemEstoque(item),
            descricao_peca: item.descricao,
          })
        }
      />
    </div>
  );
}

function SeletorPecaModal({
  aberto,
  onFechar,
  onSelecionarAvulsa,
  onSelecionarItem,
}: {
  aberto: boolean;
  onFechar: () => void;
  onSelecionarAvulsa: (peca: PecaFormValues) => void;
  onSelecionarItem: (item: ItemEstoque) => void;
}) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<CategoriaItemEstoque | ''>('');
  const [pagina, setPagina] = useState(1);
  const [modoAvulsa, setModoAvulsa] = useState(false);
  const [avulsa, setAvulsa] = useState({ descricao: '', quantidade: '', preco_unitario: '' });
  const { data, isError, isLoading } = useItensEstoque({
    ativo: true,
    com_saldo: true,
    busca: busca.trim() || undefined,
    categoria: categoria || undefined,
    pagina,
    limite: 10,
  });

  useEffect(() => {
    if (!aberto) return;
    setBusca('');
    setCategoria('');
    setPagina(1);
    setModoAvulsa(false);
    setAvulsa({ descricao: '', quantidade: '', preco_unitario: '' });
  }, [aberto]);

  if (!aberto) return null;

  const totalPaginas = data?.total_paginas ?? 1;

  return (
    <div
      aria-labelledby="titulo-seletor-peca"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/50 px-4"
      role="dialog"
    >
      <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950" id="titulo-seletor-peca">
              Selecionar peça
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Itens com saldo disponível no estoque</p>
          </div>
          <BotaoFecharModal onClick={onFechar} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <label>
            <span className="text-sm font-medium text-zinc-700">Buscar</span>
            <input
              aria-label="Buscar peça no estoque"
              autoComplete="off"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              onChange={(event) => {
                setBusca(event.target.value);
                setPagina(1);
              }}
              placeholder="Código, descrição ou marca"
              value={busca}
            />
          </label>

          <label>
            <span className="text-sm font-medium text-zinc-700">Categoria</span>
            <select
              aria-label="Filtrar por categoria"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              onChange={(event) => {
                setCategoria(event.target.value as CategoriaItemEstoque | '');
                setPagina(1);
              }}
              value={categoria}
            >
              <option value="">Todas as categorias</option>
              {categoriasItemEstoque.map((item) => (
                <option key={item} value={item}>
                  {formatarCategoria(item)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="mt-4 w-full rounded-md border border-dashed border-zinc-300 px-4 py-3 text-left text-sm font-medium text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50"
          onClick={() => setModoAvulsa(true)}
          type="button"
        >
          Peça avulsa
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
            Informar uma peça que não está cadastrada no estoque
          </span>
        </button>

        {modoAvulsa && (
          <div className="mt-4 border-l-4 border-emerald-600 bg-emerald-50 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">Nova peça avulsa</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-zinc-700">Descrição da peça</span>
                <input
                  autoFocus
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                  onChange={(event) =>
                    setAvulsa((atual) => ({ ...atual, descricao: event.target.value }))
                  }
                  value={avulsa.descricao}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-zinc-700">Quantidade</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                  inputMode="decimal"
                  onChange={(event) =>
                    setAvulsa((atual) => ({
                      ...atual,
                      quantidade: normalizarQuantidade(event.target.value),
                    }))
                  }
                  value={avulsa.quantidade}
                />
              </label>
              <label>
                <span className="text-sm font-medium text-zinc-700">Preço unitário (R$)</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                  min="0"
                  onChange={(event) =>
                    setAvulsa((atual) => ({ ...atual, preco_unitario: event.target.value }))
                  }
                  step="0.01"
                  type="number"
                  value={avulsa.preco_unitario}
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium"
                onClick={() => setModoAvulsa(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                disabled={!avulsa.descricao.trim() || Number(avulsa.quantidade) <= 0}
                onClick={() =>
                  onSelecionarAvulsa({
                    ...pecaVazia,
                    busca_item_estoque: 'Peça avulsa',
                    descricao_peca: avulsa.descricao.trim(),
                    quantidade: Number(avulsa.quantidade),
                    preco_unitario: avulsa.preco_unitario ? Number(avulsa.preco_unitario) : '',
                  })
                }
                type="button"
              >
                Adicionar peça avulsa
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                {['Código', 'Peça', 'Marca', 'Categoria', 'Disponível', ''].map((coluna) => (
                  <th
                    className="px-3 py-2 text-left text-xs font-semibold uppercase text-zinc-500"
                    key={coluna || 'acao'}
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {data?.dados.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-600">
                    {item.codigo || '-'}
                  </td>
                  <td className="min-w-56 px-3 py-3 text-sm font-medium text-zinc-900">
                    {item.descricao}
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-600">{item.marca || '-'}</td>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {formatarCategoria(item.categoria)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-emerald-800">
                    {item.saldo_atual} {item.unidade_medida}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                      onClick={() => onSelecionarItem(item)}
                      type="button"
                    >
                      Selecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLoading && (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">Carregando...</p>
          )}
          {isError && (
            <p className="px-4 py-6 text-center text-sm text-red-700">
              Não foi possível carregar as peças do estoque.
            </p>
          )}
          {!isLoading && !isError && data?.dados.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">
              Nenhuma peça com saldo disponível foi encontrada.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-500">
            {data?.total ?? 0} {data?.total === 1 ? 'item' : 'itens'}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => Math.max(atual - 1, 1))}
              type="button"
            >
              Anterior
            </button>
            <span className="min-w-20 text-center text-sm text-zinc-600">
              {pagina} de {totalPaginas}
            </span>
            <button
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((atual) => atual + 1)}
              type="button"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
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

function formatarItemEstoque(item: ItemEstoque) {
  const codigo = item.codigo ? `${item.codigo} - ` : '';
  const marca = item.marca ? ` - ${item.marca}` : '';
  return `${codigo}${item.descricao}${marca}`;
}

function formatarCategoria(categoria: CategoriaItemEstoque) {
  return categoria === 'peca' ? 'Peça' : categoria.charAt(0).toUpperCase() + categoria.slice(1);
}
