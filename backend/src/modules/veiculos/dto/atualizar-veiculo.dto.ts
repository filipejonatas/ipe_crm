import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AtualizarVeiculoDto {
  @IsOptional()
  @IsString()
  @Length(7, 7)
  @Matches(/^[A-Za-z0-9]{7}$/)
  placa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  marca?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  ano?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
