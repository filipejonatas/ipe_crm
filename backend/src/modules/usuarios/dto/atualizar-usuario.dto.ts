import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PerfilUsuario } from '../usuario.entity';

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
