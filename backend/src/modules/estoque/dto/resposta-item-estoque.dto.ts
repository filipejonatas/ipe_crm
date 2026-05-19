import { CategoriaItemEstoque } from '../entities/categoria-item-estoque.enum';

export class RespostaItemEstoqueDto {
  id!: string;
  codigo!: string | null;
  descricao!: string;
  marca!: string | null;
  categoria!: CategoriaItemEstoque;
  unidade_medida!: string;
  saldo_atual!: number;
  estoque_minimo!: number;
  ativo!: boolean;
  observacoes!: string | null;
  criado_em!: Date;
  atualizado_em!: Date;
}
