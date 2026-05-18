import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AutenticacaoService, UsuarioAutenticado } from './autenticacao.service';

@Injectable()
export class EstrategiaLocal extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly autenticacaoService: AutenticacaoService) {
    super({ usernameField: 'email', passwordField: 'senha' });
  }

  async validate(email: string, senha: string): Promise<UsuarioAutenticado> {
    const usuario = await this.autenticacaoService.validarUsuario(email, senha);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    return usuario;
  }
}
