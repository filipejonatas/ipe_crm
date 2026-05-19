import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CategoriaItemEstoque } from '../entities/categoria-item-estoque.enum';

export class CriarItemEstoqueDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsString()
  descricao!: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsEnum(CategoriaItemEstoque)
  categoria!: CategoriaItemEstoque;

  @IsOptional()
  @IsString()
  unidade_medida?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  saldo_inicial?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estoque_minimo?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
