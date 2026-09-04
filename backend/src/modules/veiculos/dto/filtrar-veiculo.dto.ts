import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

function transformarBooleano(value: unknown): boolean | undefined {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

export class FiltrarVeiculoDto {
  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => transformarBooleano(value))
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsIn(['placa', 'modelo', 'marca'])
  ordenar_por?: 'placa' | 'modelo' | 'marca';

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(['ASC', 'DESC'])
  direcao?: 'ASC' | 'DESC';

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
