import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CategoriaItemEstoque } from '../entities/categoria-item-estoque.enum';

export class AtualizarItemEstoqueDto {
  @IsOptional()
  @IsString()
  codigo?: string | null;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  marca?: string | null;

  @IsOptional()
  @IsEnum(CategoriaItemEstoque)
  categoria?: CategoriaItemEstoque;

  @IsOptional()
  @IsString()
  unidade_medida?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estoque_minimo?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string | null;
}
