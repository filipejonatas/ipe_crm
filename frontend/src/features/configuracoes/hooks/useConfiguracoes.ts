import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AtualizarConfiguracaoDto, configuracoesService } from '@/services/configuracoes.service';

export function useConfiguracoes() {
  return useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => configuracoesService.listar(),
  });
}

export function useAtualizarConfiguracao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chave, dto }: { chave: string; dto: AtualizarConfiguracaoDto }) =>
      configuracoesService.atualizar(chave, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuracoes'] }),
  });
}
