import type { Perfil } from '@ipe_crm/shared';

export class RespostaLoginDto {
  access_token!: string;
  usuario!: {
    id: string;
    nome: string;
    email: string;
    perfil: Perfil;
  };
}
