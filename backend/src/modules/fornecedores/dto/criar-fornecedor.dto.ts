import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CriarFornecedorDto {
  @IsString()
  @MaxLength(80)
  razao_social!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
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
  @MaxLength(40)
  email?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
