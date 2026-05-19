import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CategoriaItemEstoque } from '../entities/categoria-item-estoque.enum';

function transformarBooleano(value: unknown): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

export class FiltrarItensEstoqueDto {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsEnum(CategoriaItemEstoque)
  categoria?: CategoriaItemEstoque;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => transformarBooleano(value))
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => transformarBooleano(value))
  @IsBoolean()
  baixo_estoque?: boolean;

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
