import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiltrosMovimentacoesEstoque,
  RegistrarAjusteDto,
  RegistrarSaidaDto,
  estoqueService,
} from '@/services/estoque.service';

export const movimentacoesEstoqueQueryKey = (filtros?: FiltrosMovimentacoesEstoque) => [
  'movimentacoes-estoque',
  filtros,
];

function invalidarEstoque(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
  void queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
}

export function useRegistrarSaidaEstoque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarSaidaDto) => estoqueService.registrarSaida(dto),
    onSuccess: () => invalidarEstoque(queryClient),
  });
}

export function useRegistrarAjusteEstoque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: RegistrarAjusteDto) => estoqueService.registrarAjuste(dto),
    onSuccess: () => invalidarEstoque(queryClient),
  });
}

export function useMovimentacoesEstoque(filtros: FiltrosMovimentacoesEstoque) {
  return useQuery({
    queryKey: movimentacoesEstoqueQueryKey(filtros),
    queryFn: () => estoqueService.listarMovimentacoes(filtros),
  });
}

export function useMovimentacoesDoItem(itemId?: string, filtros: FiltrosMovimentacoesEstoque = {}) {
  return useQuery({
    queryKey: ['movimentacoes-estoque', itemId, filtros],
    queryFn: () => estoqueService.listarMovimentacoesDoItem(itemId!, filtros),
    enabled: Boolean(itemId),
  });
}
