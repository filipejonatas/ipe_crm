import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Fornecedor } from '@/services/fornecedores.service';
import { FornecedorFormValues, fornecedorFormSchema } from './fornecedor.schema';

interface Props {
  aberto: boolean;
  fornecedor?: Fornecedor | null;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (valores: FornecedorFormValues) => void;
}

const valoresPadrao: FornecedorFormValues = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  telefone: '',
  email: '',
  observacoes: '',
  ativo: true,
};

export function FornecedorFormModal({ aberto, fornecedor, salvando, onFechar, onSalvar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorFormSchema),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    reset(
      fornecedor
        ? {
            razao_social: fornecedor.razao_social,
            nome_fantasia: fornecedor.nome_fantasia ?? '',
            cnpj: fornecedor.cnpj ?? '',
            telefone: fornecedor.telefone ?? '',
            email: fornecedor.email ?? '',
            observacoes: fornecedor.observacoes ?? '',
            ativo: fornecedor.ativo,
          }
        : valoresPadrao,
    );
  }, [fornecedor, reset, aberto]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="w-full max-w-2xl rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Razao social</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('razao_social')}
            />
            {errors.razao_social && (
              <span className="text-xs text-red-600">{errors.razao_social.message}</span>
            )}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Nome fantasia</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('nome_fantasia')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">CNPJ</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('cnpj')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Telefone</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('telefone')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('email')}
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
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
