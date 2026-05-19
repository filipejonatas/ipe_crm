import { useEffect, useState } from 'react';
import { useAtualizarConfiguracao, useConfiguracoes } from './hooks/useConfiguracoes';

export function ConfiguracoesPage() {
  const { data, isLoading } = useConfiguracoes();
  const atualizar = useAtualizarConfiguracao();
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      setValores(
        Object.fromEntries(data.map((configuracao) => [configuracao.chave, configuracao.valor])),
      );
    }
  }, [data]);

  function salvar(chave: string, descricao: string | null) {
    void atualizar.mutate({
      chave,
      dto: { valor: valores[chave] ?? '', descricao },
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Configuracoes</h1>
        <p className="text-sm text-zinc-500">Parametros operacionais do CRM.</p>
      </div>

      <div className="rounded-md border border-zinc-200 bg-white">
        {isLoading && <p className="p-4 text-sm text-zinc-500">Carregando configuracoes...</p>}
        {!isLoading && data?.length === 0 && (
          <p className="p-4 text-sm text-zinc-500">Nenhuma configuracao encontrada.</p>
        )}
        <div className="divide-y divide-zinc-200">
          {data?.map((configuracao) => (
            <div
              className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_90px] md:items-center"
              key={configuracao.id}
            >
              <div>
                <p className="font-medium text-zinc-950">{configuracao.chave}</p>
                <p className="text-sm text-zinc-500">{configuracao.descricao ?? '-'}</p>
              </div>
              <input
                aria-label={`Valor de ${configuracao.chave}`}
                className="rounded-md border border-zinc-300 px-3 py-2"
                value={valores[configuracao.chave] ?? ''}
                onChange={(event) =>
                  setValores((estado) => ({ ...estado, [configuracao.chave]: event.target.value }))
                }
              />
              <button
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={atualizar.isPending}
                type="button"
                onClick={() => salvar(configuracao.chave, configuracao.descricao)}
              >
                Salvar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
