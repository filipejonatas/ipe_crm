export class RespostaVeiculoDto {
  id!: string;
  placa!: string;
  modelo!: string;
  marca!: string;
  ano!: number | null;
  observacoes!: string | null;
  ativo!: boolean;
  criado_em!: Date;
  atualizado_em!: Date;
}
