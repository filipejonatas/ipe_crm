import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AtualizarManutencaoVeiculoDto {
  @IsOptional()
  @IsUUID('4')
  veiculo_id?: string;

  @IsOptional()
  @IsDateString()
  data_manutencao?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99_999_999)
  quilometragem?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custo_mao_obra?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
