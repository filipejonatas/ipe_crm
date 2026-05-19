import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AtualizarItemEstoqueDto,
  CriarItemEstoqueDto,
  FiltrosItensEstoque,
  estoqueService,
} from '@/services/estoque.service';

export const itensEstoqueQueryKey = (filtros?: FiltrosItensEstoque) => ['itens-estoque', filtros];

export function useItensEstoque(filtros: FiltrosItensEstoque) {
  return useQuery({
    queryKey: itensEstoqueQueryKey(filtros),
    queryFn: () => estoqueService.listarItens(filtros),
  });
}

export function useItemEstoque(id?: string) {
  return useQuery({
    queryKey: ['itens-estoque', id],
    queryFn: () => estoqueService.buscarItemPorId(id!),
    enabled: Boolean(id),
  });
}

export function useCriarItemEstoque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarItemEstoqueDto) => estoqueService.criarItem(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      void queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    },
  });
}

export function useAtualizarItemEstoque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarItemEstoqueDto }) =>
      estoqueService.atualizarItem(id, dto),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] }),
  });
}

export function useRemoverItemEstoque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estoqueService.removerItem(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] }),
  });
}

export function useVeiculosCompativeis(itemId?: string) {
  return useQuery({
    queryKey: ['itens-estoque', itemId, 'veiculos'],
    queryFn: () => estoqueService.listarVeiculosCompativeis(itemId!),
    enabled: Boolean(itemId),
  });
}

export function useVincularVeiculosItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, veiculosIds }: { itemId: string; veiculosIds: string[] }) =>
      estoqueService.vincularVeiculos(itemId, veiculosIds),
    onSuccess: (_data, variaveis) => {
      void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      void queryClient.invalidateQueries({
        queryKey: ['itens-estoque', variaveis.itemId, 'veiculos'],
      });
    },
  });
}
