import { PERFIS } from '@ipe_crm/shared';
import { useMemo, useState } from 'react';
import { IconeAcao } from '@/components/IconeAcao';
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
  useProximoCodigoItemEstoque,
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

const colunasNumericas = ['Saldo', 'Mínimo'];

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
  const proximoCodigo = useProximoCodigoItemEstoque(modalAtivo === 'item' && !selecionado);
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
          <h1 className="titulo-pagina">Estoque</h1>
          <p className="subtitulo-pagina">Itens, saldos e movimentações da oficina.</p>
        </div>
        {podeCriarEditar && (
          <button className="btn-primario" onClick={() => abrir('item')} type="button">
            Novo item
          </button>
        )}
      </div>

      <div className="painel grid gap-3 p-4 lg:grid-cols-[1fr_180px_160px_auto]">
        <input
          aria-label="Buscar itens"
          className="campo"
          placeholder="Buscar por código, descrição ou marca"
          value={busca}
          onChange={(event) => {
            setPagina(1);
            setBusca(event.target.value);
          }}
        />
        <select
          aria-label="Categoria"
          className="campo"
          value={categoria}
          onChange={(event) => {
            setPagina(1);
            setCategoria(event.target.value);
          }}
        >
          <option value="">Categorias</option>
          {categoriasItemEstoque.map((itemCategoria) => (
            <option key={itemCategoria} value={itemCategoria}>
              {itemCategoria.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          className="campo"
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
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-concreto-escuro px-3 py-2 text-sm text-grafite hover:border-grafite-300">
          <input
            checked={baixoEstoque}
            className="h-4 w-4 accent-ferrugem"
            type="checkbox"
            onChange={(event) => {
              setPagina(1);
              setBaixoEstoque(event.target.checked);
            }}
          />
          Baixo estoque
        </label>
      </div>

      <div className="painel overflow-x-auto">
        <table className="tabela">
          <thead>
            <tr>
              {['Código', 'Item', 'Categoria', 'Saldo', 'Mínimo', 'Ações'].map((coluna) => (
                <th
                  key={coluna}
                  className={
                    coluna === 'Ações'
                      ? 'text-center'
                      : colunasNumericas.includes(coluna)
                        ? 'numero'
                        : undefined
                  }
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-8 text-grafite-500" colSpan={6}>
                  Carregando itens...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="py-8 text-grafite-500" colSpan={6}>
                  Nenhum item de estoque encontrado.
                </td>
              </tr>
            )}
            {data?.dados.map((item) => {
              const baixo = item.saldo_atual <= item.estoque_minimo;
              return (
                <tr key={item.id} className={baixo ? 'linha-baixo-estoque' : undefined}>
                  <td className="whitespace-nowrap tabular-nums text-grafite-500">
                    {item.codigo ?? '-'}
                  </td>
                  <td className="min-w-48">
                    <span
                      className={[
                        'block font-medium',
                        item.ativo ? 'text-grafite' : 'text-grafite-300',
                      ].join(' ')}
                    >
                      {item.descricao}
                      {!item.ativo && (
                        <span className="ml-2 rounded bg-concreto px-1.5 py-0.5 text-xs font-medium text-grafite-500">
                          Inativo
                        </span>
                      )}
                    </span>
                    {item.marca && (
                      <span className="block text-xs text-grafite-500">{item.marca}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{item.categoria.toUpperCase()}</td>
                  <td
                    className={[
                      'numero whitespace-nowrap font-semibold',
                      baixo ? 'text-ferrugem' : 'text-grafite',
                    ].join(' ')}
                  >
                    {item.saldo_atual}{' '}
                    <span className="text-xs font-normal text-grafite-500">
                      {item.unidade_medida}
                    </span>
                  </td>
                  <td className="numero">{item.estoque_minimo}</td>
                  <td className="w-px align-middle">
                    <div className="flex flex-nowrap items-center justify-center">
                      {podeCriarEditar && (
                        <button
                          aria-label="Editar item"
                          className="btn-icone"
                          onClick={() => abrir('item', item)}
                          title="Editar item"
                          type="button"
                        >
                          <IconeAcao tipo="editar" />
                        </button>
                      )}
                      {podeExcluir && (
                        <button
                          aria-label="Excluir item"
                          className="btn-icone-perigo"
                          onClick={() => excluir(item)}
                          title="Excluir item"
                          type="button"
                        >
                          <IconeAcao tipo="excluir" />
                        </button>
                      )}
                      {podeRegistrarSaida && (
                        <button
                          aria-label="Registrar saída"
                          className="btn-icone"
                          onClick={() => abrir('saida', item)}
                          title="Registrar saída"
                          type="button"
                        >
                          <IconeAcao tipo="saida" />
                        </button>
                      )}
                      {podeAjustar && (
                        <button
                          aria-label="Ajustar saldo"
                          className="btn-icone"
                          onClick={() => abrir('ajuste', item)}
                          title="Ajustar saldo"
                          type="button"
                        >
                          <IconeAcao tipo="ajustar" />
                        </button>
                      )}
                      <button
                        aria-label="Veículos compatíveis"
                        className="btn-icone"
                        onClick={() => abrir('veiculos', item)}
                        title="Veículos compatíveis"
                        type="button"
                      >
                        <IconeAcao tipo="veiculos" />
                      </button>
                      <button
                        aria-label="Histórico de movimentações"
                        className="btn-icone"
                        onClick={() => abrir('historico', item)}
                        title="Histórico de movimentações"
                        type="button"
                      >
                        <IconeAcao tipo="historico" />
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
          className="btn-secundario"
          disabled={pagina <= 1}
          onClick={() => setPagina((valor) => valor - 1)}
          type="button"
        >
          Anterior
        </button>
        <span className="text-sm tabular-nums text-grafite-500">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          className="btn-secundario"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((valor) => valor + 1)}
          type="button"
        >
          Próxima
        </button>
      </div>

      <ItemEstoqueFormModal
        aberto={modalAtivo === 'item'}
        codigoSugerido={proximoCodigo.data?.codigo}
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
        erro={vincularVeiculos.isError}
        onFechar={fecharModal}
        onSalvar={(veiculosIds) =>
          vincularVeiculos.mutate(
            { itemId: selecionado!.id, veiculosIds },
            { onSuccess: fecharModal },
          )
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
