import { Icone, type NomeIcone } from './Icone';

export type TipoIconeAcao = 'editar' | 'excluir' | 'saida' | 'ajustar' | 'veiculos' | 'historico';

const iconePorAcao: Record<TipoIconeAcao, NomeIcone> = {
  editar: 'editar',
  excluir: 'excluir',
  saida: 'saida',
  ajustar: 'ajustar',
  veiculos: 'veiculo',
  historico: 'historico',
};

export function IconeAcao({ tipo }: { tipo: TipoIconeAcao }) {
  return <Icone nome={iconePorAcao[tipo]} />;
}
