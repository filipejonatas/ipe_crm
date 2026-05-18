import { SetMetadata } from '@nestjs/common';
import type { Perfil } from '@ipe_crm/shared';

export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);
