export class RespostaFornecedorDto {
  id!: string;
  razao_social!: string;
  nome_fantasia!: string | null;
  cnpj!: string | null;
  telefone!: string | null;
  email!: string | null;
  observacoes!: string | null;
  ativo!: boolean;
  criado_em!: Date;
  atualizado_em!: Date;
}
