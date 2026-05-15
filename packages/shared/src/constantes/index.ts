import type { Perfil } from '../tipos';

export const PERFIS: Record<
  'ADMIN' | 'COMPRAS' | 'OFICINA' | 'ADMINISTRATIVO' | 'GERENTE',
  Perfil
> = {
  ADMIN: 'admin',
  COMPRAS: 'compras',
  OFICINA: 'oficina',
  ADMINISTRATIVO: 'administrativo',
  GERENTE: 'gerente',
};
