import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ItemEstoque, RegistrarSaidaDto } from '@/services/estoque.service';
import { useVeiculos } from '@/features/veiculos/hooks/useVeiculos';
import { useVeiculosCompativeis } from './hooks/useItensEstoque';

interface SaidaFormValues {
  quantidade: number | '';
  veiculo_id: string;
  observacoes: string;
}

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  salvando?: boolean;
  erro?: unknown;
  onFechar: () => void;
  onSalvar: (dto: RegistrarSaidaDto) => Promise<unknown> | void;
}

export function RegistrarSaidaModal({ aberto, item, salvando, erro, onFechar, onSalvar }: Props) {
  const [erroLocal, setErroLocal] = useState('');
  const { data: compativeis } = useVeiculosCompativeis(item?.id);
  const { data: veiculos } = useVeiculos({ ativo: true, limite: 100 });
  const opcoesVeiculos = useMemo(
    () => (compativeis && compativeis.length > 0 ? compativeis : (veiculos?.dados ?? [])),
    [compativeis, veiculos?.dados],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaidaFormValues>({
    defaultValues: { quantidade: '', veiculo_id: '', observacoes: '' },
  });

  useEffect(() => {
    reset({ quantidade: '', veiculo_id: '', observacoes: '' });
    setErroLocal('');
  }, [aberto, reset]);

  if (!aberto || !item) return null;

  async function salvar(valores: SaidaFormValues) {
    setErroLocal('');
    const quantidade = Number(valores.quantidade);
    if (valores.quantidade === '' || Number.isNaN(quantidade)) {
      setErroLocal('Quantidade e obrigatoria');
      return;
    }
    if (quantidade <= 0) {
      setErroLocal('Quantidade deve ser maior que zero');
      return;
    }
    if (item!.categoria === 'filtro' && !valores.veiculo_id) {
      setErroLocal('Saida de filtro exige veiculo informado');
      return;
    }
    try {
      await onSalvar({
        item_estoque_id: item!.id,
        quantidade,
        veiculo_id: valores.veiculo_id || undefined,
        observacoes: valores.observacoes || null,
      });
    } catch (error) {
      const mensagem =
        error instanceof AxiosError
          ? ((error.response?.data as { message?: string; mensagem?: string })?.message ??
            (error.response?.data as { mensagem?: string })?.mensagem)
          : undefined;
      setErroLocal(mensagem ?? 'Nao foi possivel registrar a saida.');
    }
  }

  const erroServidor =
    erro instanceof AxiosError
      ? ((erro.response?.data as { message?: string; mensagem?: string })?.message ??
        (erro.response?.data as { mensagem?: string })?.mensagem)
      : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-xl rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">Registrar saida</h2>
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit(salvar)}>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Item</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
              readOnly
              value={item.descricao}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Quantidade utilizada</span>
            <input
              aria-label="Quantidade utilizada"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              type="number"
              step="0.001"
              {...register('quantidade')}
            />
            {errors.quantidade && (
              <span className="text-xs text-red-600">{errors.quantidade.message}</span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Veiculo</span>
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('veiculo_id')}
            >
              <option value="">Sem veiculo</option>
              {opcoesVeiculos.map((veiculo) => (
                <option key={veiculo.id} value={veiculo.id}>
                  {veiculo.placa} - {veiculo.modelo}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Observacoes</span>
            <textarea
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              rows={3}
              {...register('observacoes')}
            />
          </label>
          {(erroLocal || erroServidor) && (
            <p className="text-sm text-red-600">{erroLocal || erroServidor}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium"
              onClick={onFechar}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={salvando}
              type="submit"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
