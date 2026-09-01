import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min, ValidateIf } from 'class-validator';

export class PecaManutencaoDto {
  @IsOptional()
  @IsUUID('4')
  item_estoque_id?: string;

  @ValidateIf((dto: PecaManutencaoDto) => !dto.item_estoque_id)
  @IsString()
  descricao_peca?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0.1)
  quantidade!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preco_unitario!: number;
}
