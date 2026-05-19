export class RespostaConfiguracaoDto {
  id!: string;
  chave!: string;
  valor!: string;
  descricao!: string | null;
  criado_em!: Date;
  atualizado_em!: Date;
}
