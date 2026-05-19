import { DataSource } from 'typeorm';
import { Configuracao } from '../../modules/configuracoes/configuracao.entity';

const configuracoesPadrao = [
  {
    chave: 'alerta_contrato_dias',
    valor: '30',
    descricao: 'dias de antecedencia para alertas de vencimento de contrato',
  },
  {
    chave: 'alerta_contrato_dias_critico',
    valor: '7',
    descricao: 'dias para alerta critico de vencimento',
  },
];

export async function seedConfiguracoes(dataSource: DataSource) {
  const repository = dataSource.getRepository(Configuracao);

  for (const configuracao of configuracoesPadrao) {
    const existente = await repository.findOne({ where: { chave: configuracao.chave } });
    if (!existente) {
      await repository.save(repository.create(configuracao));
    }
  }
}
