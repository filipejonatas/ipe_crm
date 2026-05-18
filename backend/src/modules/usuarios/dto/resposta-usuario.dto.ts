import type { Perfil } from '@ipe_crm/shared';

export class RespostaUsuarioDto {
  id!: string;
  nome!: string;
  email!: string;
  perfil!: Perfil;
  ativo!: boolean;
  criado_em!: Date;
  atualizado_em!: Date;
  excluido_em!: Date | null;
}
