import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  categoriasItemEstoque,
  CriarItemEstoqueDto,
  ItemEstoque,
} from '@/services/estoque.service';

const textoOpcional = z.string().trim().optional().or(z.literal(''));

export const itemEstoqueFormSchema = z.object({
  codigo: textoOpcional,
  descricao: z.string().trim().min(1, 'Descricao e obrigatoria'),
  marca: textoOpcional,
  categoria: z
    .string()
    .min(1, 'Categoria e obrigatoria')
    .pipe(z.enum(['filtro', 'pneu', 'ferramenta', 'peca', 'insumo', 'outro'])),
  unidade_medida: z.string().trim().min(1, 'Unidade e obrigatoria'),
  saldo_inicial: z.coerce.number().min(0, 'Saldo inicial nao pode ser negativo').optional(),
  estoque_minimo: z.coerce.number().min(0, 'Estoque minimo nao pode ser negativo'),
  ativo: z.boolean(),
  observacoes: textoOpcional,
});

export type ItemEstoqueFormValues = z.infer<typeof itemEstoqueFormSchema>;

interface Props {
  aberto: boolean;
  item?: ItemEstoque | null;
  salvando?: boolean;
  onFechar: () => void;
  onSalvar: (valores: CriarItemEstoqueDto & { ativo?: boolean }) => void;
}

const valoresPadrao: ItemEstoqueFormValues = {
  codigo: '',
  descricao: '',
  marca: '',
  categoria: 'filtro',
  unidade_medida: 'un',
  saldo_inicial: 0,
  estoque_minimo: 0,
  ativo: true,
  observacoes: '',
};

export function ItemEstoqueFormModal({ aberto, item, salvando, onFechar, onSalvar }: Props) {
  const editando = Boolean(item);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemEstoqueFormValues>({
    resolver: zodResolver(itemEstoqueFormSchema),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    reset(
      item
        ? {
            codigo: item.codigo ?? '',
            descricao: item.descricao,
            marca: item.marca ?? '',
            categoria: item.categoria,
            unidade_medida: item.unidade_medida,
            saldo_inicial: 0,
            estoque_minimo: item.estoque_minimo,
            ativo: item.ativo,
            observacoes: item.observacoes ?? '',
          }
        : valoresPadrao,
    );
  }, [aberto, item, reset]);

  if (!aberto) return null;

  function salvar(valores: ItemEstoqueFormValues) {
    const dto = Object.fromEntries(
      Object.entries(valores).map(([chave, valor]) => [chave, valor === '' ? null : valor]),
    ) as unknown as CriarItemEstoqueDto & { ativo?: boolean };
    if (editando) delete dto.saldo_inicial;
    onSalvar(dto);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950">
            {editando ? 'Editar item' : 'Novo item'}
          </h2>
          <button className="text-sm font-medium text-zinc-500" onClick={onFechar} type="button">
            Fechar
          </button>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(salvar)}>
          <label>
            <span className="text-sm font-medium text-zinc-700">Codigo</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('codigo')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Categoria</span>
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('categoria')}
            >
              <option value="">Selecione</option>
              {categoriasItemEstoque.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <span className="text-xs text-red-600">{errors.categoria.message}</span>
            )}
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Descricao</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('descricao')}
            />
            {errors.descricao && (
              <span className="text-xs text-red-600">{errors.descricao.message}</span>
            )}
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Marca</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('marca')}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-zinc-700">Unidade de medida</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              {...register('unidade_medida')}
            />
          </label>
          {!editando && (
            <label>
              <span className="text-sm font-medium text-zinc-700">Saldo inicial</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                type="number"
                step="0.001"
                {...register('saldo_inicial')}
              />
              {errors.saldo_inicial && (
                <span className="text-xs text-red-600">{errors.saldo_inicial.message}</span>
              )}
            </label>
          )}
          <label>
            <span className="text-sm font-medium text-zinc-700">Estoque minimo</span>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              type="number"
              step="0.001"
              {...register('estoque_minimo')}
            />
            {errors.estoque_minimo && (
              <span className="text-xs text-red-600">{errors.estoque_minimo.message}</span>
            )}
          </label>
          {editando && (
            <label className="flex items-center gap-2">
              <input className="h-4 w-4" type="checkbox" {...register('ativo')} />
              <span className="text-sm font-medium text-zinc-700">Ativo</span>
            </label>
          )}
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-zinc-700">Observacoes</span>
            <textarea
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              rows={3}
              {...register('observacoes')}
            />
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
