import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Perfil } from '@ipe_crm/shared';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

interface RequisicaoComUsuario {
  user?: {
    perfil?: Perfil;
  };
}

@Injectable()
export class GuardPerfis implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfis = this.reflector.getAllAndOverride<Perfil[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfis?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequisicaoComUsuario>();
    const perfilUsuario = request.user?.perfil;

    if (!perfilUsuario || !perfis.includes(perfilUsuario)) {
      throw new ForbiddenException('Perfil sem permissao para acessar o recurso');
    }

    return true;
  }
}
