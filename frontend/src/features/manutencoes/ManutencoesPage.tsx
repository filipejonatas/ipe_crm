import { PERFIS } from '@ipe_crm/shared';
import { useMemo, useState } from 'react';
import type { CriarManutencaoVeiculoDto, ManutencaoVeiculo } from '@/services/manutencoes.service';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { ManutencaoFormModal } from './ManutencaoFormModal';
import {
  useAtualizarManutencao,
  useCriarManutencao,
  useManutencoes,
  useRemoverManutencao,
} from './hooks/useManutencoes';

export function ManutencoesPage() {
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const [placa, setPlaca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<ManutencaoVeiculo | null>(null);
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
  const criar = useCriarManutencao();
  const atualizar = useAtualizarManutencao();
  const remover = useRemoverManutencao();

  const totalPaginas =
    data?.total_paginas ?? Math.max(Math.ceil((data?.total ?? 0) / (data?.limite ?? 10)), 1);

  function abrirNova() {
    setSelecionada(null);
    setModalAberto(true);
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
    const mutacao = selecionada
      ? atualizar.mutateAsync({ id: selecionada.id, dto })
      : criar.mutateAsync(dto);
    return mutacao.then(fecharModal);
  }

  function excluir(manutencao: ManutencaoVeiculo) {
    if (window.confirm(`Excluir manutencao da placa ${manutencao.placa}?`)) {
      void remover.mutate(manutencao.id);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Manutencoes</h1>
          <p className="text-sm text-zinc-500">Historico de servicos realizados por veiculo.</p>
        </div>
        {podeGerenciar && (
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
            onClick={abrirNova}
            type="button"
          >
            Nova manutencao
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 lg:grid-cols-[1fr_180px_180px]">
        <input
          aria-label="Buscar por placa"
          className="rounded-md border border-zinc-300 px-3 py-2"
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
                'Manutencao',
                'Pecas',
                'Custo total',
                'Registrado por',
                'Acoes',
              ].map((coluna) => (
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500"
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
                  Carregando manutencoes...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={7}>
                  Nenhuma manutencao encontrada.
                </td>
              </tr>
            )}
            {data?.dados.map((manutencao) => (
              <tr key={manutencao.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600">
                  {formatarData(manutencao.data_manutencao)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">{manutencao.placa}</td>
                <td className="max-w-sm px-4 py-3 text-sm text-zinc-700">
                  <p className="line-clamp-2">{manutencao.descricao}</p>
                  {manutencao.quilometragem !== null && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {manutencao.quilometragem.toLocaleString('pt-BR')} km
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {manutencao.pecas.length > 0 ? (
                    <div className="space-y-1">
                      {manutencao.pecas.slice(0, 2).map((peca) => (
                        <p key={peca.id}>
                          {peca.quantidade}x {peca.descricao_peca}
                        </p>
                      ))}
                      {manutencao.pecas.length > 2 && (
                        <p className="text-xs text-zinc-500">
                          +{manutencao.pecas.length - 2} peca(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-900">
                  {formatarMoeda(manutencao.custo_total)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {manutencao.usuario_nome ?? '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap justify-end gap-2">
                    {podeGerenciar && (
                      <button
                        className="font-medium text-emerald-700"
                        onClick={() => editar(manutencao)}
                        type="button"
                      >
                        Editar
                      </button>
                    )}
                    {usuario?.perfil === PERFIS.ADMIN && (
                      <button
                        className="font-medium text-red-700"
                        onClick={() => excluir(manutencao)}
                        type="button"
                      >
                        Excluir
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

      <ManutencaoFormModal
        aberto={modalAberto}
        erro={criar.error ?? atualizar.error}
        manutencao={selecionada}
        salvando={criar.isPending || atualizar.isPending}
        onFechar={fecharModal}
        onSalvar={salvar}
      />
    </section>
  );
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(data));
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
