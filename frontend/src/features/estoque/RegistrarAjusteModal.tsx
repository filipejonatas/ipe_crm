import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ItemEstoque, RegistrarAjusteDto } from '@/services/estoque.service';

const ajusteSchema = z.object({
  novo_saldo: z.coerce.number().min(0, 'Novo saldo nao pode ser negativo'),
  motivo: z.string().trim().min(5, 'Motivo deve ter pelo menos 5 caracteres'),
});

type AjusteFormValues = z.infer<typeof ajusteSchema>;

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (dto: RegistrarAjusteDto) => void;
}

export function RegistrarAjusteModal({ aberto, item, salvando, onFechar, onSalvar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AjusteFormValues>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: { novo_saldo: 0, motivo: '' },
  });

  useEffect(() => {
    reset({ novo_saldo: item?.saldo_atual ?? 0, motivo: '' });
  }, [aberto, item, reset]);

  if (!aberto || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">Ajustar saldo</h2>
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>
        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit((valores) =>
            onSalvar({
              item_estoque_id: item.id,
              novo_saldo: valores.novo_saldo,
              motivo: valores.motivo,
            }),
          )}
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Item</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
              readOnly
              value={item.descricao}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Saldo atual</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
              readOnly
              value={item.saldo_atual}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Novo saldo</span>
            <input
              aria-label="Novo saldo"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              type="number"
              step="0.001"
              {...register('novo_saldo')}
            />
            {errors.novo_saldo && (
              <span className="text-xs text-red-600">{errors.novo_saldo.message}</span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Motivo</span>
            <textarea
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              rows={3}
              {...register('motivo')}
            />
            {errors.motivo && <span className="text-xs text-red-600">{errors.motivo.message}</span>}
          </label>
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
              Ajustar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
