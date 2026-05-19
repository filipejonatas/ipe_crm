import { useMemo, useState } from 'react';
import {
  ItemEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@/services/estoque.service';
import { useMovimentacoesDoItem } from './hooks/useMovimentacoesEstoque';

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  onFechar: () => void;
}

const tipos: TipoMovimentacaoEstoque[] = ['entrada', 'saida', 'ajuste'];
const origens: OrigemMovimentacaoEstoque[] = [
  'saldo_inicial',
  'utilizacao_oficina',
  'compra',
  'ajuste_manual',
];

export function HistoricoMovimentacoesModal({ aberto, item, onFechar }: Props) {
  const [tipo, setTipo] = useState('');
  const [origem, setOrigem] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const filtros = useMemo(
    () => ({
      tipo: (tipo || undefined) as TipoMovimentacaoEstoque | undefined,
      origem: (origem || undefined) as OrigemMovimentacaoEstoque | undefined,
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
      limite: 20,
    }),
    [dataFim, dataInicio, origem, tipo],
  );
  const { data, isLoading } = useMovimentacoesDoItem(item?.id, filtros);

  if (!aberto || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Historico</h2>
            <p className="text-sm text-zinc-500">{item.descricao}</p>
          </div>
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <select
            aria-label="Tipo"
            className="rounded-md border border-zinc-300 px-3 py-2"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          >
            <option value="">Todos os tipos</option>
            {tipos.map((itemTipo) => (
              <option key={itemTipo} value={itemTipo}>
                {itemTipo}
              </option>
            ))}
          </select>
          <select
            aria-label="Origem"
            className="rounded-md border border-zinc-300 px-3 py-2"
            value={origem}
            onChange={(event) => setOrigem(event.target.value)}
          >
            <option value="">Todas as origens</option>
            {origens.map((itemOrigem) => (
              <option key={itemOrigem} value={itemOrigem}>
                {itemOrigem}
              </option>
            ))}
          </select>
          <input
            aria-label="Data inicio"
            className="rounded-md border border-zinc-300 px-3 py-2"
            type="date"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
          />
          <input
            aria-label="Data fim"
            className="rounded-md border border-zinc-300 px-3 py-2"
            type="date"
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
          />
        </div>

        <div className="mt-5 overflow-x-auto rounded-md border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                {[
                  'Data/hora',
                  'Tipo',
                  'Origem',
                  'Qtd.',
                  'Anterior',
                  'Posterior',
                  'Veiculo',
                  'Usuario',
                  'Observacoes',
                ].map((coluna) => (
                  <th
                    key={coluna}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase text-zinc-500"
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading && (
                <tr>
                  <td className="px-3 py-5 text-sm text-zinc-500" colSpan={9}>
                    Carregando historico...
                  </td>
                </tr>
              )}
              {!isLoading && data?.dados.length === 0 && (
                <tr>
                  <td className="px-3 py-5 text-sm text-zinc-500" colSpan={9}>
                    Nenhuma movimentacao encontrada.
                  </td>
                </tr>
              )}
              {data?.dados.map((movimentacao) => (
                <tr key={movimentacao.id}>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {new Date(movimentacao.criado_em).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-600">{movimentacao.tipo}</td>
                  <td className="px-3 py-3 text-sm text-zinc-600">{movimentacao.origem}</td>
                  <td className="px-3 py-3 text-sm text-zinc-600">{movimentacao.quantidade}</td>
                  <td className="px-3 py-3 text-sm text-zinc-600">{movimentacao.saldo_anterior}</td>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {movimentacao.saldo_posterior}
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {movimentacao.veiculo?.placa ?? '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {movimentacao.usuario?.nome ?? movimentacao.usuario?.email ?? '-'}
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-600">
                    {movimentacao.observacoes ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
