import { useEffect, useState } from 'react';
import { ItemEstoque } from '@/services/estoque.service';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useVeiculosCompativeis } from './hooks/useItensEstoque';

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  somenteLeitura?: boolean;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (veiculosIds: string[]) => void;
}

export function VeiculosCompativeisModal({
  aberto,
  item,
  somenteLeitura,
  salvando,
  onFechar,
  onSalvar,
}: Props) {
  const { data: veiculos } = useVeiculos({ ativo: true, limite: 100 });
  const { data: compativeis } = useVeiculosCompativeis(item?.id);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    setSelecionados(compativeis?.map((veiculo) => veiculo.id) ?? []);
  }, [aberto, compativeis]);

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
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-500">{item.descricao}</p>
        <div className="mt-5 divide-y divide-zinc-200 rounded-md border border-zinc-200">
          {veiculos?.dados.length === 0 && (
            <p className="px-4 py-5 text-sm text-zinc-500">Nenhum veiculo ativo encontrado.</p>
          )}
          {veiculos?.dados.map((veiculo) => (
            <label key={veiculo.id} className="flex items-center gap-3 px-4 py-3">
              <input
                className="h-4 w-4"
                checked={selecionados.includes(veiculo.id)}
                disabled={somenteLeitura}
                type="checkbox"
                onChange={() => alternar(veiculo.id)}
              />
              <span className="text-sm text-zinc-800">
                {veiculo.placa} - {veiculo.modelo} / {veiculo.marca}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium"
            onClick={onFechar}
            type="button"
          >
            {somenteLeitura ? 'Fechar' : 'Cancelar'}
          </button>
          {!somenteLeitura && (
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={salvando}
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
