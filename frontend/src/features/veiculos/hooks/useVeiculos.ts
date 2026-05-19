import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AtualizarVeiculoDto,
  CriarVeiculoDto,
  FiltrosVeiculos,
  veiculosService,
} from '@/services/veiculos.service';

export const veiculosQueryKey = (filtros: FiltrosVeiculos) => ['veiculos', filtros];

export function useVeiculos(filtros: FiltrosVeiculos) {
  return useQuery({
    queryKey: veiculosQueryKey(filtros),
    queryFn: () => veiculosService.listar(filtros),
  });
}

export function useCriarVeiculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarVeiculoDto) => veiculosService.criar(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  });
}

export function useAtualizarVeiculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarVeiculoDto }) =>
      veiculosService.atualizar(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  });
}

export function useRemoverVeiculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => veiculosService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['veiculos'] }),
  });
}
