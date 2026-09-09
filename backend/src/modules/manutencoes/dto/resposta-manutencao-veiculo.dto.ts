export class RespostaManutencaoPecaDto {
  id!: string;
  item_estoque_id!: string | null;
  movimentacao_estoque_id!: string | null;
  descricao_peca!: string;
  quantidade!: number;
  preco_unitario!: number;
  valor_total!: number;
  criado_em!: Date;
}

export class RespostaManutencaoVeiculoDto {
  troca_oleo!: boolean;
  proxima_troca_oleo!: string | null;
  proxima_troca_oleo_km!: number | null;
  id!: string;
  veiculo_id!: string;
  placa!: string;
  data_manutencao!: string;
  descricao!: string;
  quilometragem!: number | null;
  custo_mao_obra!: number;
  custo_total!: number;
  observacoes!: string | null;
  usuario_id!: string;
  usuario_nome?: string;
  pecas!: RespostaManutencaoPecaDto[];
  criado_em!: Date;
  atualizado_em!: Date;
}
