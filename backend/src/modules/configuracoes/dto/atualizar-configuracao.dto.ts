import { IsOptional, IsString } from 'class-validator';

export class AtualizarConfiguracaoDto {
  @IsString()
  valor!: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
