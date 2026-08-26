import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PecaManutencaoDto } from './peca-manutencao.dto';

export class CriarManutencaoVeiculoDto {
  @IsUUID('4')
  veiculo_id!: string;

  @IsDateString()
  data_manutencao!: string;

  @IsString()
  descricao!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quilometragem?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custo_mao_obra?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PecaManutencaoDto)
  pecas?: PecaManutencaoDto[];
}
