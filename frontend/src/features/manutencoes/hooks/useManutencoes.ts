import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AtualizarManutencaoVeiculoDto,
  CriarManutencaoVeiculoDto,
  FiltrosManutencoesVeiculo,
  manutencoesService,
} from '@/services/manutencoes.service';

export const manutencoesQueryKey = (filtros?: FiltrosManutencoesVeiculo) => [
  'manutencoes-veiculos',
  filtros,
];

export function useManutencoes(filtros: FiltrosManutencoesVeiculo) {
  return useQuery({
    queryKey: manutencoesQueryKey(filtros),
    queryFn: () => manutencoesService.listar(filtros),
  });
}

export function useCriarManutencao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarManutencaoVeiculoDto) => manutencoesService.criar(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manutencoes-veiculos'] });
      void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      void queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    },
  });
}

export function useAtualizarManutencao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarManutencaoVeiculoDto }) =>
      manutencoesService.atualizar(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manutencoes-veiculos'] });
      void queryClient.invalidateQueries({ queryKey: ['itens-estoque'] });
      void queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    },
  });
}

export function useRemoverManutencao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manutencoesService.remover(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['manutencoes-veiculos'] }),
  });
}
