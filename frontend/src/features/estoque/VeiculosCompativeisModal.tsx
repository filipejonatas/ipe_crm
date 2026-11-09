import { useEffect, useState } from 'react';
import { BotaoFecharModal } from '@/components/BotaoFecharModal';
import { Placa } from '@/components/Placa';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grafite/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-grafite">Veículos compatíveis</h2>
          <BotaoFecharModal onClick={onFechar} />
        </div>
        <p className="mt-1 text-sm text-grafite-500">{item.descricao}</p>
        {erro && (
          <p role="alert" className="mensagem-erro mt-2">
            Não foi possível salvar os vínculos. Tente novamente.
          </p>
        )}
        <input
          aria-label="Buscar veículo"
          placeholder="Buscar veículo"
          value={busca}
          className="campo mt-4"
          onChange={(event) => {
            setBusca(event.target.value);
            setPagina(1);
          }}
        />
        {(veiculosQuery.isPending || compativeisQuery.isPending) && (
          <p className="mt-3 text-sm text-grafite-500" role="status">
            Carregando veículos e vínculos...
          </p>
        )}
        {(veiculosQuery.isError || compativeisQuery.isError) && (
          <p className="mensagem-erro mt-3" role="alert">
            Não foi possível carregar os veículos ou vínculos. Feche e tente novamente.
          </p>
        )}
        <div className="mt-4 divide-y divide-concreto rounded-md border border-concreto-escuro">
          {veiculos?.dados.length === 0 && (
            <p className="px-4 py-5 text-sm text-grafite-500">Nenhum veículo ativo encontrado.</p>
          )}
          {veiculos?.dados.map((veiculo) => (
            <label
              key={veiculo.id}
              className="flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-concreto/60"
            >
              <input
                className="h-4 w-4 accent-grafite"
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
              <Placa placa={veiculo.placa} />
              <span className={veiculo.ativo ? 'text-grafite' : 'text-grafite-300'}>
                <span className="block text-sm font-medium">
                  {veiculo.modelo}
                  {!veiculo.ativo && ' (inativo)'}
                </span>
                <span className="block text-xs text-grafite-500">{veiculo.marca}</span>
              </span>
            </label>
          ))}
        </div>
        {(veiculos?.total_paginas ?? 0) > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <button
              className="btn-secundario"
              type="button"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </button>
            <span className="text-sm tabular-nums text-grafite-500">
              Página {pagina} de {veiculos?.total_paginas}
            </span>
            <button
              className="btn-secundario"
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
            <button className="btn-secundario" onClick={onFechar} type="button">
              Cancelar
            </button>
          )}
          {!somenteLeitura && (
            <button
              className="btn-primario"
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
