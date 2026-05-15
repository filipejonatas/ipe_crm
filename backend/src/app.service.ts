import { Injectable } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return `API IPÊ CRM (perfil ref: ${PERFIS.ADMIN})`;
  }
}
