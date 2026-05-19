import { useMemo, useState } from 'react';
import type { CriarVeiculoDto, Veiculo } from '@/services/veiculos.service';
import { VeiculoFormModal } from './VeiculoFormModal';
import { VeiculoFormValues } from './veiculo.schema';
import {
  useAtualizarVeiculo,
  useCriarVeiculo,
  useRemoverVeiculo,
  useVeiculos,
} from './hooks/useVeiculos';

function limparVazios<T extends Record<string, unknown>>(valores: T) {
  return Object.fromEntries(
    Object.entries(valores).map(([chave, valor]) => [chave, valor === '' ? null : valor]),
  ) as T;
}

export function VeiculosPage() {
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Veiculo | null>(null);
  const filtros = useMemo(
    () => ({
      busca: busca || undefined,
      ativo: ativo === '' ? undefined : ativo === 'true',
      pagina,
      limite: 10,
    }),
    [ativo, busca, pagina],
  );
  const { data, isLoading } = useVeiculos(filtros);
  const criar = useCriarVeiculo();
  const atualizar = useAtualizarVeiculo();
  const remover = useRemoverVeiculo();

  function abrirNovo() {
    setSelecionado(null);
    setModalAberto(true);
  }

  function salvar(valores: VeiculoFormValues) {
    const dto = limparVazios(valores) as CriarVeiculoDto;
    const mutacao = selecionado
      ? atualizar.mutateAsync({ id: selecionado.id, dto })
      : criar.mutateAsync(dto);
    void mutacao.then(() => setModalAberto(false));
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
          <h1 className="text-2xl font-semibold text-zinc-950">Veiculos</h1>
          <p className="text-sm text-zinc-500">Frota disponivel para oficina, compras e gestao.</p>
        </div>
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
          onClick={abrirNovo}
          type="button"
        >
          Novo Veiculo
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-white p-4 sm:flex-row">
        <input
          aria-label="Buscar veiculos"
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
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
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
                Marca
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={5}>
                  Carregando veiculos...
                </td>
              </tr>
            )}
            {!isLoading && data?.dados.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-zinc-500" colSpan={5}>
                  Nenhum veiculo encontrado.
                </td>
              </tr>
            )}
            {data?.dados.map((veiculo) => (
              <tr key={veiculo.id}>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900">{veiculo.placa}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {veiculo.modelo}
                  {veiculo.ano ? ` / ${veiculo.ano}` : ''}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">{veiculo.marca}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {veiculo.ativo ? 'Ativo' : 'Inativo'}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <button
                    className="mr-3 font-medium text-emerald-700"
                    onClick={() => {
                      setSelecionado(veiculo);
                      setModalAberto(true);
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="font-medium text-red-700"
                    onClick={() => excluir(veiculo)}
                    type="button"
                  >
                    Excluir
                  </button>
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

      <VeiculoFormModal
        aberto={modalAberto}
        veiculo={selecionado}
        salvando={criar.isPending || atualizar.isPending}
        onFechar={() => setModalAberto(false)}
        onSalvar={salvar}
      />
    </section>
  );
}
