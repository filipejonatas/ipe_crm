import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { OrigemMovimentacaoEstoque } from '../entities/origem-movimentacao-estoque.enum';
import { TipoMovimentacaoEstoque } from '../entities/tipo-movimentacao-estoque.enum';

export class FiltrarMovimentacoesEstoqueDto {
  @IsOptional()
  @IsUUID('4')
  item_estoque_id?: string;

  @IsOptional()
  @IsEnum(TipoMovimentacaoEstoque)
  tipo?: TipoMovimentacaoEstoque;

  @IsOptional()
  @IsEnum(OrigemMovimentacaoEstoque)
  origem?: OrigemMovimentacaoEstoque;

  @IsOptional()
  @IsUUID('4')
  veiculo_id?: string;

  @IsOptional()
  @IsUUID('4')
  usuario_id?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}
