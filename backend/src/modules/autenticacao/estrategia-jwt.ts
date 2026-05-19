import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Perfil } from '@ipe_crm/shared';

interface JwtPayload {
  sub: string;
  nome?: string;
  email: string;
  perfil: Perfil;
}

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev_secret',
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil,
    };
  }
}
