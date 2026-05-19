import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AcaoAuditoria } from '../log-auditoria.entity';

export class FiltrarAuditoriaDto {
  @IsOptional()
  @IsString()
  entidade?: string;

  @IsOptional()
  @IsEnum(AcaoAuditoria)
  acao?: AcaoAuditoria;

  @IsOptional()
  @IsString()
  usuario_id?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}
