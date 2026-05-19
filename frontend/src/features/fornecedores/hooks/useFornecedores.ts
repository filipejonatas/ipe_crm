import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AtualizarFornecedorDto,
  CriarFornecedorDto,
  FiltrosFornecedores,
  fornecedoresService,
} from '@/services/fornecedores.service';

export const fornecedoresQueryKey = (filtros: FiltrosFornecedores) => ['fornecedores', filtros];

export function useFornecedores(filtros: FiltrosFornecedores) {
  return useQuery({
    queryKey: fornecedoresQueryKey(filtros),
    queryFn: () => fornecedoresService.listar(filtros),
  });
}

export function useCriarFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarFornecedorDto) => fornecedoresService.criar(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fornecedores'] }),
  });
}

export function useAtualizarFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarFornecedorDto }) =>
      fornecedoresService.atualizar(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fornecedores'] }),
  });
}

export function useRemoverFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fornecedoresService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fornecedores'] }),
  });
}
