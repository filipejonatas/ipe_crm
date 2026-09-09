import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { manutencoesService } from '@/services/manutencoes.service';

function formatarData(data: string) {
  return data.split('-').reverse().join('/');
}

export function TrocasOleoPage() {
  const [placa, setPlaca] = useState('');
  const [pagina, setPagina] = useState(1);
  const filtros = { placa, pagina, limite: 10 };
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['manutencoes-veiculos', 'trocas-oleo', filtros],
    queryFn: () => manutencoesService.listarTrocasOleo(filtros),
  });
  const agora = new Date();
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Trocas de óleo</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Próximas trocas dos veículos ativos, em ordem de data. A troca mais recente de cada
            veículo define o próximo prazo.
          </p>
        </div>
      </div>
      <label className="block text-sm font-medium">
        Buscar por placa
        <input
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 sm:max-w-sm"
          value={placa}
          onChange={(event) => {
            setPlaca(event.target.value);
            setPagina(1);
          }}
          placeholder="Placa do veículo"
        />
      </label>
      {isPending ? (
        <p role="status">Carregando próximas trocas...</p>
      ) : isError ? (
        <div role="alert">
          Não foi possível carregar as próximas trocas.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {data?.dados.length === 0 ? (
            <p className="rounded-md border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Nenhuma troca de óleo encontrada. Marque “Troca de óleo” em uma manutenção e informe a
              próxima data.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600">
                  <tr>
                    {[
                      'Veículo',
                      'Última troca',
                      'Próxima troca',
                      'Próxima quilometragem',
                      'Situação',
                    ].map((titulo) => (
                      <th className="whitespace-nowrap px-4 py-3 font-medium" key={titulo}>
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {data?.dados.map((troca) => {
                    const proxima = troca.proxima_troca_oleo;
                    const situacao = !proxima
                      ? 'Sem data'
                      : proxima < hoje
                        ? 'Vencida'
                        : proxima === hoje
                          ? 'Hoje'
                          : 'Agendada';
                    return (
                      <tr key={troca.id}>
                        <td className="px-4 py-3 font-medium">{troca.placa}</td>
                        <td className="px-4 py-3">{formatarData(troca.data_manutencao)}</td>
                        <td className="px-4 py-3">{proxima ? formatarData(proxima) : '—'}</td>
                        <td className="px-4 py-3">
                          {troca.proxima_troca_oleo_km != null
                            ? `${troca.proxima_troca_oleo_km.toLocaleString('pt-BR')} km`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${situacao === 'Vencida' ? 'bg-red-50 text-red-700' : situacao === 'Hoje' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
                          >
                            {situacao}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {(data?.total_paginas ?? 0) > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                className="rounded-md border px-3 py-2 disabled:opacity-50"
                type="button"
                disabled={pagina <= 1}
                onClick={() => setPagina(pagina - 1)}
              >
                Anterior
              </button>
              <span>
                Página {pagina} de {data?.total_paginas}
              </span>
              <button
                className="rounded-md border px-3 py-2 disabled:opacity-50"
                type="button"
                disabled={pagina >= (data?.total_paginas ?? 0)}
                onClick={() => setPagina(pagina + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
