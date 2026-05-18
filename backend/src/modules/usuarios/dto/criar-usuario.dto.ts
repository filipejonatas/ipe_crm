import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { PerfilUsuario } from '../usuario.entity';

export class CriarUsuarioDto {
  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  senha!: string;

  @IsEnum(PerfilUsuario)
  perfil!: PerfilUsuario;
}
