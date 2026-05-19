import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class VincularVeiculosItemDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  veiculos_ids!: string[];
}
