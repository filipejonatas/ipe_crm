import { PERFIS } from '@ipe_crm/shared';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { IconeAcao } from '@/components/IconeAcao';
import type { CriarVeiculoDto, Veiculo } from '@/services/veiculos.service';
import { useAutenticacaoStore } from '@/store/autenticacao.store';
import { VeiculoFormModal } from './VeiculoFormModal';
import { VeiculoFormValues } from './veiculo.schema';
import {
  useAtualizarVeiculo,
  useCriarVeiculo,
  useRemoverVeiculo,
  useVeiculos,
} from './hooks/useVeiculos';

type CampoOrdenacaoVeiculo = 'placa' | 'modelo' | 'marca';

type MensagemFeedback = {
  tipo: 'sucesso' | 'erro';
  texto: string;
};

function limparVazios<T extends Record<string, unknown>>(valores: T) {
  return Object.fromEntries(
    Object.entries(valores).map(([chave, valor]) => [chave, valor === '' ? null : valor]),
  ) as T;
}

function mensagemErroSalvar(erro: unknown) {
  if (isAxiosError<{ message?: unknown }>(erro)) {
    if (erro.response?.status === 409) {
      return 'Veículo já cadastrado. Confira a placa informada.';
    }

    const mensagem = erro.response?.data?.message;
    if (typeof mensagem === 'string') {
      return mensagem;
    }
  }

  return 'Não foi possível salvar o veículo. Tente novamente.';
}

export function VeiculosPage() {
  const usuario = useAutenticacaoStore((state) => state.usuario);
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState<CampoOrdenacaoVeiculo>('modelo');
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Veiculo | null>(null);
  const [mensagem, setMensagem] = useState<MensagemFeedback | null>(null);
  const filtros = useMemo(
    () => ({
      busca: busca || undefined,
      ativo: ativo === '' ? undefined : ativo === 'true',
      ordenar_por: ordenarPor,
      direcao: 'ASC' as const,
      pagina,
      limite: 10,
    }),
    [ativo, busca, ordenarPor, pagina],
  );
  const { data, isLoading } = useVeiculos(filtros);
  const criar = useCriarVeiculo();
  const atualizar = useAtualizarVeiculo();
  const remover = useRemoverVeiculo();
  const podeGerenciar = usuario?.perfil === PERFIS.ADMIN;

  function abrirNovo() {
    setSelecionado(null);
    setMensagem(null);
    setModalAberto(true);
  }

  function salvar(valores: VeiculoFormValues) {
    const dto = limparVazios(valores) as CriarVeiculoDto;
    const editando = Boolean(selecionado);
    const mutacao = selecionado
      ? atualizar.mutateAsync({ id: selecionado.id, dto })
      : criar.mutateAsync(dto);
    setMensagem(null);
    void mutacao
      .then((veiculo) => {
        setMensagem({
          tipo: 'sucesso',
          texto: editando
            ? `Veículo ${veiculo.placa} atualizado com sucesso.`
            : `Veículo ${veiculo.placa} cadastrado com sucesso.`,
        });
        setModalAberto(false);
      })
      .catch((erro: unknown) => {
        setMensagem({ tipo: 'erro', texto: mensagemErroSalvar(erro) });
      });
  }

  function excluir(veiculo: Veiculo) {
    if (window.confirm(`Excluir ${veiculo.placa}?`)) {
      void remover.mutate(veiculo.id);
    }
  }

  const totalPaginas = Math.max(Math.ceil((data?.total ?? 0) / (data?.limite ?? 10)), 1);

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Veículos</h1>
          <p className="text-sm text-zinc-500">Frota disponível para oficina, compras e gestão.</p>
        </div>
        {podeGerenciar && (
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
            onClick={abrirNovo}
            type="button"
          >
            Novo veículo
          </button>
        )}
      </div>

      {mensagem?.tipo === 'sucesso' && (
        <div
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          role="status"
        >
          {mensagem.texto}
        </div>
      )}

      <div className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_180px_200px]">
        <input
          aria-label="Buscar veículos"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="Buscar por placa, modelo ou marca"
          value={busca}
          onChange={(event) => {
            setPagina(1);
            setBusca(event.target.value);
          }}
        />
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
        <select
          aria-label="Ordenar por"
          className="rounded-md border border-zinc-300 px-3 py-2"
          value={ordenarPor}
          onChange={(event) => {
            setPagina(1);
            setOrdenarPor(event.target.value as CampoOrdenacaoVeiculo);
          }}
        >
          <option value="modelo">Modelo (A-Z)</option>
          <option value="marca">Marca (A-Z)</option>
          <option value="placa">Placa (A-Z)</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Placa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Ano
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Marca
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-zinc-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                  Carregando veículos...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                  Nenhum veículo encontrado.
                </td>
              </tr>
            )}
            {data?.dados.map((veiculo) => (
              <tr key={veiculo.id}>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">{veiculo.placa}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{veiculo.modelo}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{veiculo.ano ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{veiculo.marca}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {veiculo.ativo ? 'Ativo' : 'Inativo'}
                </td>
                <td className="px-4 py-3 align-middle text-sm">
                  {podeGerenciar && (
                    <div className="flex flex-nowrap items-center justify-center gap-2">
                      <button
                        aria-label="Editar veículo"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                        onClick={() => {
                          setSelecionado(veiculo);
                          setModalAberto(true);
                        }}
                        title="Editar veículo"
                        type="button"
                      >
                        <IconeAcao tipo="editar" />
                      </button>
                      <button
                        aria-label="Excluir veículo"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50"
                        onClick={() => excluir(veiculo)}
                        title="Excluir veículo"
                        type="button"
                      >
                        <IconeAcao tipo="excluir" />
                      </button>
                    </div>
                  )}
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

      <VeiculoFormModal
        aberto={modalAberto}
        veiculo={selecionado}
        erroSalvar={mensagem?.tipo === 'erro' ? mensagem.texto : undefined}
        salvando={criar.isPending || atualizar.isPending}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvar}
      />
    </section>
  );
}
