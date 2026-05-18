import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Perfil } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RespostaLoginDto } from './dto/resposta-login.dto';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

@Injectable()
export class AutenticacaoService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<UsuarioAutenticado | null> {
    const usuario = await this.usuariosService.buscarPorEmail(email);

    if (!usuario?.ativo) {
      return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return null;
    }

    return this.paraUsuarioAutenticado(usuario);
  }

  async login(usuario: UsuarioAutenticado): Promise<RespostaLoginDto> {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ??
          '8h') as SignOptions['expiresIn'],
      }),
      usuario,
    };
  }

  private paraUsuarioAutenticado(usuario: Usuario): UsuarioAutenticado {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }
}
