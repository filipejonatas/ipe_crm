import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class AtualizarFornecedorDto {
  @IsOptional()
  @IsString()
  razao_social?: string;

  @IsOptional()
  @IsString()
  nome_fantasia?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
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
