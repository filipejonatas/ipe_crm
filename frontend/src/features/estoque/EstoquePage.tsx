import { PERFIS } from '@ipe_crm/shared';
import { useMemo, useState } from 'react';
import {
  CategoriaItemEstoque,
  categoriasItemEstoque,
  CriarItemEstoqueDto,
  ItemEstoque,
} from '@/services/estoque.service';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { HistoricoMovimentacoesModal } from './HistoricoMovimentacoesModal';
import {
  useAtualizarItemEstoque,
  useCriarItemEstoque,
  useItensEstoque,
  useRemoverItemEstoque,
  useVincularVeiculosItem,
} from './hooks/useItensEstoque';
import {
  useRegistrarAjusteEstoque,
  useRegistrarSaidaEstoque,
} from './hooks/useMovimentacoesEstoque';
import { ItemEstoqueFormModal } from './ItemEstoqueFormModal';
import { RegistrarAjusteModal } from './RegistrarAjusteModal';
import { RegistrarSaidaModal } from './RegistrarSaidaModal';
import { VeiculosCompativeisModal } from './VeiculosCompativeisModal';

type ModalAtivo = 'item' | 'saida' | 'ajuste' | 'veiculos' | 'historico' | null;

export function EstoquePage() {
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ativo, setAtivo] = useState('');
  const [baixoEstoque, setBaixoEstoque] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [modalAtivo, setModalAtivo] = useState<ModalAtivo>(null);
  const [selecionado, setSelecionado] = useState<ItemEstoque | null>(null);
  const perfil = usuario?.perfil;

  const podeCriarEditar = Boolean(
    perfil && [PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS].includes(perfil),
  );
  const podeExcluir = usuario?.perfil === PERFIS.ADMIN;
  const podeRegistrarSaida = Boolean(perfil && [PERFIS.ADMIN, PERFIS.OFICINA].includes(perfil));
  const podeAjustar = Boolean(perfil && [PERFIS.ADMIN, PERFIS.GERENTE].includes(perfil));
  const podeEditarVeiculos = Boolean(perfil && [PERFIS.ADMIN, PERFIS.OFICINA].includes(perfil));

  const filtros = useMemo(
    () => ({
      busca: busca || undefined,
      categoria: (categoria || undefined) as CategoriaItemEstoque | undefined,
      ativo: ativo === '' ? undefined : ativo === 'true',
      baixo_estoque: baixoEstoque || undefined,
      pagina,
      limite: 10,
    }),
    [ativo, baixoEstoque, busca, categoria, pagina],
  );
  const { data, isLoading } = useItensEstoque(filtros);
  const criar = useCriarItemEstoque();
  const atualizar = useAtualizarItemEstoque();
  const remover = useRemoverItemEstoque();
  const registrarSaida = useRegistrarSaidaEstoque();
  const registrarAjuste = useRegistrarAjusteEstoque();
  const vincularVeiculos = useVincularVeiculosItem();

  const totalPaginas =
    data?.total_paginas ?? Math.max(Math.ceil((data?.total ?? 0) / (data?.limite ?? 10)), 1);

  function abrir(modal: ModalAtivo, item?: ItemEstoque) {
    setSelecionado(item ?? null);
    setModalAtivo(modal);
  }

  function fecharModal() {
    setModalAtivo(null);
    setSelecionado(null);
  }

  function salvarItem(dto: CriarItemEstoqueDto & { ativo?: boolean }) {
    const mutacao = selecionado
      ? atualizar.mutateAsync({ id: selecionado.id, dto })
      : criar.mutateAsync(dto);
    void mutacao.then(fecharModal);
  }

  function excluir(item: ItemEstoque) {
    if (window.confirm(`Excluir ${item.descricao}?`)) {
      void remover.mutate(item.id);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Estoque</h1>
          <p className="text-sm text-zinc-500">Itens, saldos e movimentacoes da oficina.</p>
        </div>
        {podeCriarEditar && (
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
            onClick={() => abrir('item')}
            type="button"
          >
            Novo item
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 lg:grid-cols-[1fr_180px_160px_150px]">
        <input
          aria-label="Buscar itens"
          className="rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Buscar por codigo, descricao ou marca"
          value={busca}
          onChange={(event) => {
            setPagina(1);
            setBusca(event.target.value);
          }}
        />
        <select
          aria-label="Categoria"
          className="rounded-md border border-zinc-300 px-3 py-2"
          value={categoria}
          onChange={(event) => {
            setPagina(1);
            setCategoria(event.target.value);
          }}
        >
          <option value="">Categorias</option>
          {categoriasItemEstoque.map((itemCategoria) => (
            <option key={itemCategoria} value={itemCategoria}>
              {itemCategoria}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          className="rounded-md border border-zinc-300 px-3 py-2"
          value={ativo}
          onChange={(event) => {
            setPagina(1);
            setAtivo(event.target.value);
          }}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700">
          <input
            checked={baixoEstoque}
            className="h-4 w-4"
            type="checkbox"
            onChange={(event) => {
              setPagina(1);
              setBaixoEstoque(event.target.checked);
            }}
          />
          Baixo estoque
        </label>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {[
                'Codigo',
                'Descricao',
                'Marca',
                'Categoria',
                'Saldo atual',
                'Estoque minimo',
                'Unidade',
                'Status',
                'Acoes',
              ].map((coluna) => (
                <th
                  key={coluna}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500"
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={9}>
                  Carregando itens...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={9}>
                  Nenhum item de estoque encontrado.
                </td>
              </tr>
            )}
            {data?.dados.map((item) => {
              const baixo = item.saldo_atual <= item.estoque_minimo;
              return (
                <tr key={item.id} className={baixo ? 'bg-amber-50' : undefined}>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.codigo ?? '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{item.descricao}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.marca ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.categoria}</td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                    {item.saldo_atual}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.estoque_minimo}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{item.unidade_medida}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap justify-end gap-2">
                      {podeCriarEditar && (
                        <button
                          className="font-medium text-emerald-700"
                          onClick={() => abrir('item', item)}
                          type="button"
                        >
                          Editar
                        </button>
                      )}
                      {podeExcluir && (
                        <button
                          className="font-medium text-red-700"
                          onClick={() => excluir(item)}
                          type="button"
                        >
                          Excluir
                        </button>
                      )}
                      {podeRegistrarSaida && (
                        <button
                          className="font-medium text-blue-700"
                          onClick={() => abrir('saida', item)}
                          type="button"
                        >
                          Registrar saida
                        </button>
                      )}
                      {podeAjustar && (
                        <button
                          className="font-medium text-violet-700"
                          onClick={() => abrir('ajuste', item)}
                          type="button"
                        >
                          Ajustar saldo
                        </button>
                      )}
                      <button
                        className="font-medium text-zinc-700"
                        onClick={() => abrir('veiculos', item)}
                        type="button"
                      >
                        Veiculos
                      </button>
                      <button
                        className="font-medium text-zinc-700"
                        onClick={() => abrir('historico', item)}
                        type="button"
                      >
                        Historico
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          disabled={pagina <= 1}
          onClick={() => setPagina((valor) => valor - 1)}
          type="button"
        >
          Anterior
        </button>
        <span className="text-sm text-zinc-600">
          Pagina {pagina} de {totalPaginas}
        </span>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((valor) => valor + 1)}
          type="button"
        >
          Proxima
        </button>
      </div>

      <ItemEstoqueFormModal
        aberto={modalAtivo === 'item'}
        item={selecionado}
        salvando={criar.isPending || atualizar.isPending}
        onFechar={fecharModal}
        onSalvar={salvarItem}
      />
      <RegistrarSaidaModal
        aberto={modalAtivo === 'saida'}
        erro={registrarSaida.error}
        item={selecionado}
        salvando={registrarSaida.isPending}
        onFechar={fecharModal}
        onSalvar={(dto) => registrarSaida.mutateAsync(dto).then(fecharModal)}
      />
      <RegistrarAjusteModal
        aberto={modalAtivo === 'ajuste'}
        item={selecionado}
        salvando={registrarAjuste.isPending}
        onFechar={fecharModal}
        onSalvar={(dto) => void registrarAjuste.mutateAsync(dto).then(fecharModal)}
      />
      <VeiculosCompativeisModal
        aberto={modalAtivo === 'veiculos'}
        item={selecionado}
        somenteLeitura={!podeEditarVeiculos}
        salvando={vincularVeiculos.isPending}
        onFechar={fecharModal}
        onSalvar={(veiculosIds) =>
          void vincularVeiculos
            .mutateAsync({ itemId: selecionado!.id, veiculosIds })
            .then(fecharModal)
        }
      />
      <HistoricoMovimentacoesModal
        aberto={modalAtivo === 'historico'}
        item={selecionado}
        onFechar={fecharModal}
      />
    </section>
  );
}
