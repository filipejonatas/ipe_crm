import { IsBoolean, IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class CriarFornecedorDto {
  @IsString()
  razao_social!: string;

  @IsOptional()
  @IsString()
  nome_fantasia?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\) \d{5}-\d{4}$/)
  telefone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
