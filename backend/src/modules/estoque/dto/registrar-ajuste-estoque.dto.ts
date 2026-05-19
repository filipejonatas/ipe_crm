import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class RegistrarAjusteEstoqueDto {
  @IsUUID('4')
  item_estoque_id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  novo_saldo!: number;

  @IsString()
  @MinLength(5)
  motivo!: string;
}
