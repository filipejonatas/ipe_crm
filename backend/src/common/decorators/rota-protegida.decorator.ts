import { applyDecorators, UseGuards } from '@nestjs/common';
import type { Perfil } from '@ipe_crm/shared';
import { Perfis } from './perfis.decorator';
import { GuardJwt } from '../guards/guard-jwt';
import { GuardPerfis } from '../guards/guard-perfis';

export const RotaProtegida = (...perfis: Perfil[]) =>
  applyDecorators(Perfis(...perfis), UseGuards(GuardJwt, GuardPerfis));
