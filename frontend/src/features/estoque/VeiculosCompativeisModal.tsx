import { useEffect, useState } from 'react';
import { BotaoFecharModal } from '@/components/BotaoFecharModal';
import { ItemEstoque } from '@/services/estoque.service';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useVeiculosCompativeis } from './hooks/useItensEstoque';

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  somenteLeitura?: boolean;
  salvando?: boolean;
  erro?: boolean;
  onFechar: () => void;
  onSalvar: (veiculosIds: string[]) => void;
}

export function VeiculosCompativeisModal({
  aberto,
  item,
  somenteLeitura,
  salvando,
  erro,
  onFechar,
  onSalvar,
}: Props) {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const veiculosQuery = useVeiculos({ busca, pagina, limite: 20 });
  const { data: veiculos } = veiculosQuery;
  const compativeisQuery = useVeiculosCompativeis(aberto ? item?.id : undefined);
  const { data: compativeis } = compativeisQuery;
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    setSelecionados(compativeis?.map((veiculo) => veiculo.id) ?? []);
  }, [aberto, item?.id, compativeis]);

  useEffect(() => {
    setPagina(1);
    setBusca('');
  }, [aberto, item?.id]);

  if (!aberto || !item) return null;

  function alternar(id: string) {
    setSelecionados((atuais) =>
      atuais.includes(id) ? atuais.filter((itemId) => itemId !== id) : [...atuais, id],
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">Veiculos compativeis</h2>
          <BotaoFecharModal onClick={onFechar} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">{item.descricao}</p>
        {erro && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            Não foi possível salvar os vínculos. Tente novamente.
          </p>
        )}
        <input
          aria-label="Buscar veículo"
          placeholder="Buscar veículo"
          value={busca}
          className="mt-4 w-full rounded-md border border-zinc-300 px-3 py-2"
          onChange={(event) => {
            setBusca(event.target.value);
            setPagina(1);
          }}
        />
        {(veiculosQuery.isPending || compativeisQuery.isPending) && (
          <p role="status">Carregando veículos e vínculos...</p>
        )}
        {(veiculosQuery.isError || compativeisQuery.isError) && (
          <p role="alert">
            Não foi possível carregar os veículos ou vínculos. Feche e tente novamente.
          </p>
        )}
        <div className="mt-5 divide-y divide-zinc-200 rounded-md border border-zinc-200">
          {veiculos?.dados.length === 0 && (
            <p className="px-4 py-5 text-sm text-zinc-500">Nenhum veiculo ativo encontrado.</p>
          )}
          {veiculos?.dados.map((veiculo) => (
            <label key={veiculo.id} className="flex items-center gap-3 px-4 py-3">
              <input
                className="h-4 w-4"
                checked={selecionados.includes(veiculo.id)}
                disabled={
                  somenteLeitura ||
                  salvando ||
                  compativeisQuery.isPending ||
                  compativeisQuery.isError ||
                  (!veiculo.ativo && !selecionados.includes(veiculo.id))
                }
                type="checkbox"
                onChange={() => alternar(veiculo.id)}
              />
              <span className="text-sm text-zinc-800">
                {veiculo.placa} - {veiculo.modelo} / {veiculo.marca}
                {!veiculo.ativo && ' (inativo)'}
              </span>
            </label>
          ))}
        </div>
        {(veiculos?.total_paginas ?? 0) > 1 && (
          <div className="mt-3 flex justify-between">
            <button type="button" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
              Anterior
            </button>
            <span>
              Página {pagina} de {veiculos?.total_paginas}
            </span>
            <button
              type="button"
              disabled={pagina >= (veiculos?.total_paginas ?? 0)}
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima
            </button>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          {!somenteLeitura && (
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium"
              onClick={onFechar}
              type="button"
            >
              Cancelar
            </button>
          )}
          {!somenteLeitura && (
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={
                salvando ||
                compativeisQuery.isPending ||
                compativeisQuery.isError ||
                veiculosQuery.isPending ||
                veiculosQuery.isError
              }
              type="button"
              onClick={() => onSalvar(selecionados)}
            >
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
