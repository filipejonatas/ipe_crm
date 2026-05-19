import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class RegistrarSaidaEstoqueDto {
  @IsUUID('4')
  item_estoque_id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantidade!: number;

  @IsOptional()
  @IsUUID('4')
  veiculo_id?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
