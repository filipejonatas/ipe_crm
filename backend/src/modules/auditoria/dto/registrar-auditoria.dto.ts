import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AcaoAuditoria } from '../log-auditoria.entity';

export class RegistrarAuditoriaDto {
  @IsString()
  entidade!: string;

  @IsString()
  entidade_id!: string;

  @IsEnum(AcaoAuditoria)
  acao!: AcaoAuditoria;

  @IsOptional()
  @IsObject()
  dados_anteriores?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  dados_novos?: Record<string, unknown> | null;

  @IsString()
  usuario_id!: string;

  @IsString()
  usuario_nome!: string;
}
