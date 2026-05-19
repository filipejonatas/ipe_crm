import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Veiculo } from '@/services/veiculos.service';
import { VeiculoFormValues, veiculoFormSchema } from './veiculo.schema';

interface Props {
  aberto: boolean;
  veiculo?: Veiculo | null;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (valores: VeiculoFormValues) => void;
}

const valoresPadrao: VeiculoFormValues = {
  placa: '',
  modelo: '',
  marca: '',
  ano: '',
  observacoes: '',
  ativo: true,
};

export function VeiculoFormModal({ aberto, veiculo, salvando, onFechar, onSalvar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VeiculoFormValues>({
    resolver: zodResolver(veiculoFormSchema),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    reset(
      veiculo
        ? {
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            marca: veiculo.marca,
            ano: veiculo.ano ?? '',
            observacoes: veiculo.observacoes ?? '',
            ativo: veiculo.ativo,
          }
        : valoresPadrao,
    );
  }, [veiculo, reset, aberto]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-2xl rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">
            {veiculo ? 'Editar Veiculo' : 'Novo Veiculo'}
          </h2>
          <button
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            onClick={onFechar}
            type="button"
          >
            Fechar
          </button>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSalvar)}>
          <label>
            <span className="text-sm font-medium text-zinc-700">Placa</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 uppercase"
              {...register('placa')}
            />
            {errors.placa && <span className="text-xs text-red-600">{errors.placa.message}</span>}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Ano</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              type="number"
              {...register('ano')}
            />
            {errors.ano && <span className="text-xs text-red-600">Ano invalido</span>}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Modelo</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('modelo')}
            />
            {errors.modelo && <span className="text-xs text-red-600">{errors.modelo.message}</span>}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Marca</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('marca')}
            />
            {errors.marca && <span className="text-xs text-red-600">{errors.marca.message}</span>}
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Observacoes</span>
            <textarea
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              rows={3}
              {...register('observacoes')}
            />
          </label>
          <label className="flex items-center gap-2">
            <input className="h-4 w-4" type="checkbox" {...register('ativo')} />
            <span className="text-sm font-medium text-zinc-700">Ativo</span>
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
