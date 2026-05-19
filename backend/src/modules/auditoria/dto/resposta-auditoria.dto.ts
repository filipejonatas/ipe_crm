import { AcaoAuditoria } from '../log-auditoria.entity';

export class RespostaAuditoriaDto {
  id!: string;
  entidade!: string;
  entidade_id!: string;
  acao!: AcaoAuditoria;
  dados_anteriores!: Record<string, unknown> | null;
  dados_novos!: Record<string, unknown> | null;
  usuario_id!: string;
  usuario_nome!: string;
  criado_em!: Date;
}
