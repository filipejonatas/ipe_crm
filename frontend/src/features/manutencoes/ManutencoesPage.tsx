import { PERFIS } from '@ipe_crm/shared';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconeAcao } from '@/components/IconeAcao';
import type { CriarManutencaoVeiculoDto, ManutencaoVeiculo } from '@/services/manutencoes.service';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { ManutencaoFormModal } from './ManutencaoFormModal';
import {
  useAtualizarManutencao,
  useManutencoes,
  useRemoverManutencao,
} from './hooks/useManutencoes';

export function ManutencoesPage() {
  const navigate = useNavigate();
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const [placa, setPlaca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<ManutencaoVeiculo | null>(null);
  const [visualizada, setVisualizada] = useState<ManutencaoVeiculo | null>(null);
  const podeGerenciar = Boolean(
    usuario?.perfil && [PERFIS.ADMIN, PERFIS.OFICINA].includes(usuario.perfil),
  );

  const filtros = useMemo(
    () => ({
      placa: placa || undefined,
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
      pagina,
      limite: 10,
    }),
    [dataFim, dataInicio, pagina, placa],
  );

  const { data, isLoading } = useManutencoes(filtros);
  const atualizar = useAtualizarManutencao();
  const remover = useRemoverManutencao();

  const totalPaginas =
    data?.total_paginas ?? Math.max(Math.ceil((data?.total ?? 0) / (data?.limite ?? 10)), 1);

  function abrirNova() {
    navigate('/manutencoes/nova');
  }

  function editar(manutencao: ManutencaoVeiculo) {
    setSelecionada(manutencao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setSelecionada(null);
  }

  function salvar(dto: CriarManutencaoVeiculoDto) {
    if (!selecionada) return;

    return atualizar.mutateAsync({ id: selecionada.id, dto }).then(fecharModal);
  }

  function excluir(manutencao: ManutencaoVeiculo) {
    if (window.confirm(`Excluir manutenção da placa ${manutencao.placa}?`)) {
      void remover.mutate(manutencao.id);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Manutenções</h1>
          <p className="text-sm text-zinc-500">Histórico de serviços realizados por veículo.</p>
        </div>
        {podeGerenciar && (
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
            onClick={abrirNova}
            type="button"
          >
            Nova manutenção
          </button>
        )}
      </div>

      <div className="grid items-center gap-3 rounded-md border border-zinc-200 bg-white p-4 lg:grid-cols-6">
        <input
          aria-label="Buscar por placa"
          className="rounded-md border border-zinc-300 px-3 py-2 lg:col-span-4"
          placeholder="Buscar por placa"
          value={placa}
          onChange={(event) => {
            setPagina(1);
            setPlaca(event.target.value);
          }}
        />
        <input
          aria-label="Data inicial"
          className="rounded-md border border-zinc-300 px-3 py-2"
          type="date"
          value={dataInicio}
          onChange={(event) => {
            setPagina(1);
            setDataInicio(event.target.value);
          }}
        />
        <input
          aria-label="Data final"
          className="rounded-md border border-zinc-300 px-3 py-2"
          type="date"
          value={dataFim}
          onChange={(event) => {
            setPagina(1);
            setDataFim(event.target.value);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {[
                'Data',
                'Placa',
                'Manutenção',
                'Peças',
                'Custo total',
                'Registrado por',
                'Ações',
              ].map((coluna) => (
                <th
                  className={[
                    'px-4 py-3 align-middle text-xs font-semibold uppercase text-zinc-500',
                    coluna === 'Ações' ? 'text-center' : 'text-left',
                  ].join(' ')}
                  key={coluna}
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                  Carregando manutenções...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                  Nenhuma manutenção encontrada.
                </td>
              </tr>
            )}
            {data?.dados.map((manutencao) => (
              <tr key={manutencao.id}>
                <td className="whitespace-nowrap px-4 py-3 align-middle text-sm text-zinc-600">
                  {formatarData(manutencao.data_manutencao)}
                </td>
                <td className="px-4 py-3 align-middle text-sm font-medium text-zinc-900">
                  <button
                    className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                    onClick={() => setVisualizada(manutencao)}
                    type="button"
                  >
                    {manutencao.placa}
                  </button>
                </td>
                <td className="max-w-sm px-4 py-3 align-middle text-sm text-zinc-700">
                  <p className="line-clamp-2">{manutencao.descricao}</p>
                  {manutencao.quilometragem !== null && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {manutencao.quilometragem.toLocaleString('pt-BR')} km
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-zinc-600">
                  {manutencao.pecas.length > 0 ? (
                    <div className="space-y-1">
                      {manutencao.pecas.slice(0, 2).map((peca) => (
                        <p key={peca.id}>
                          {peca.quantidade}x {peca.descricao_peca}
                        </p>
                      ))}
                      {manutencao.pecas.length > 2 && (
                        <p className="text-xs text-zinc-500">
                          +{manutencao.pecas.length - 2} peça(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-middle text-sm font-medium text-zinc-900">
                  {formatarMoeda(manutencao.custo_total)}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-zinc-600">
                  {manutencao.usuario_nome ?? '-'}
                </td>
                <td className="px-4 py-3 align-middle text-sm">
                  <div className="flex flex-nowrap items-center justify-center gap-2">
                    <button
                      aria-label="Visualizar manutenÃ§Ã£o"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                      onClick={() => setVisualizada(manutencao)}
                      title="Visualizar manutenÃ§Ã£o"
                      type="button"
                    >
                      <IconeAcao tipo="historico" />
                    </button>
                    {podeGerenciar && (
                      <button
                        aria-label="Editar manutenção"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                        onClick={() => editar(manutencao)}
                        title="Editar manutenção"
                        type="button"
                      >
                        <IconeAcao tipo="editar" />
                      </button>
                    )}
                    {usuario?.perfil === PERFIS.ADMIN && (
                      <button
                        aria-label="Excluir manutenção"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50"
                        onClick={() => excluir(manutencao)}
                        title="Excluir manutenção"
                        type="button"
                      >
                        <IconeAcao tipo="excluir" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
          Página {pagina} de {totalPaginas}
        </span>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((valor) => valor + 1)}
          type="button"
        >
          Próxima
        </button>
      </div>

      <ManutencaoFormModal
        aberto={modalAberto}
        erro={atualizar.error}
        manutencao={selecionada}
        salvando={atualizar.isPending}
        onFechar={fecharModal}
        onSalvar={salvar}
      />

      {visualizada && (
        <DetalhesManutencaoModal manutencao={visualizada} onFechar={() => setVisualizada(null)} />
      )}
    </section>
  );
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(data));
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function DetalhesManutencaoModal({
  manutencao,
  onFechar,
}: {
  manutencao: ManutencaoVeiculo;
  onFechar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">ManutenÃ§Ã£o {manutencao.placa}</h2>
            <p className="text-sm text-zinc-500">{formatarData(manutencao.data_manutencao)}</p>
          </div>
          <button
            aria-label="Fechar detalhes da manutenÃ§Ã£o"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium"
            onClick={onFechar}
            type="button"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-500">Quilometragem</span>
            <p className="mt-1 text-sm text-zinc-900">
              {manutencao.quilometragem !== null
                ? `${manutencao.quilometragem.toLocaleString('pt-BR')} km`
                : '-'}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-500">MÃ£o de obra</span>
            <p className="mt-1 text-sm text-zinc-900">{formatarMoeda(manutencao.custo_mao_obra)}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-500">Total</span>
            <p className="mt-1 text-sm font-semibold text-emerald-800">
              {formatarMoeda(manutencao.custo_total)}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold uppercase text-zinc-500">ManutenÃ§Ã£o feita</h3>
          <p className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            {manutencao.descricao}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold uppercase text-zinc-500">PeÃ§as utilizadas</h3>
          {manutencao.pecas.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    {['PeÃ§a', 'Qtd.', 'UnitÃ¡rio', 'Total'].map((coluna) => (
                      <th
                        className="px-3 py-2 text-left text-xs font-semibold uppercase text-zinc-500"
                        key={coluna}
                      >
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {manutencao.pecas.map((peca) => (
                    <tr key={peca.id}>
                      <td className="px-3 py-2 text-sm text-zinc-800">{peca.descricao_peca}</td>
                      <td className="px-3 py-2 text-sm text-zinc-600">{peca.quantidade}</td>
                      <td className="px-3 py-2 text-sm text-zinc-600">
                        {formatarMoeda(peca.preco_unitario)}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-zinc-900">
                        {formatarMoeda(peca.valor_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-md bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
              Nenhuma peÃ§a vinculada.
            </p>
          )}
        </div>

        {manutencao.observacoes && (
          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-semibold uppercase text-zinc-500">ObservaÃ§Ãµes</h3>
            <p className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
              {manutencao.observacoes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
