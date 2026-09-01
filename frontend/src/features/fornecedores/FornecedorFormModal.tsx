import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BotaoFecharModal } from '@/components/BotaoFecharModal';
import type { Fornecedor } from '@/services/fornecedores.service';
import {
  FornecedorFormValues,
  fornecedorFormSchema,
  LIMITES_FORNECEDOR,
} from './fornecedor.schema';

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

function somenteDigitos(valor: string, limite: number) {
  return valor.replace(/\D/g, '').slice(0, limite);
}

function formatarTelefone(valor: string) {
  const digitos = somenteDigitos(valor, 11);
  if (digitos.length <= 2) return digitos ? `(${digitos}` : '';
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function FornecedorFormModal({ aberto, fornecedor, salvando, onFechar, onSalvar }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
            cnpj: somenteDigitos(fornecedor.cnpj ?? '', 14),
            telefone: formatarTelefone(fornecedor.telefone ?? ''),
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
          <BotaoFecharModal onClick={onFechar} />
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSalvar)}>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Razão social</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              maxLength={LIMITES_FORNECEDOR.razaoSocial}
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
              maxLength={LIMITES_FORNECEDOR.nomeFantasia}
              {...register('nome_fantasia')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">CNPJ</span>
            <input
              inputMode="numeric"
              maxLength={14}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('cnpj', {
                onChange: (event) => {
                  setValue('cnpj', somenteDigitos(String(event.target.value), 14), {
                    shouldValidate: true,
                  });
                },
              })}
            />
            {errors.cnpj && <span className="text-xs text-red-600">{errors.cnpj.message}</span>}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Telefone</span>
            <input
              inputMode="numeric"
              maxLength={15}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('telefone', {
                onChange: (event) => {
                  setValue('telefone', formatarTelefone(String(event.target.value)), {
                    shouldValidate: true,
                  });
                },
              })}
            />
            {errors.telefone && (
              <span className="text-xs text-red-600">{errors.telefone.message}</span>
            )}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">E-mail</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              maxLength={LIMITES_FORNECEDOR.email}
              type="email"
              {...register('email')}
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Observações</span>
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
