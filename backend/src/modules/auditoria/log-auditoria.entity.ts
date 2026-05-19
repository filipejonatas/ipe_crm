import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AcaoAuditoria {
  CRIACAO = 'criacao',
  EDICAO = 'edicao',
  EXCLUSAO = 'exclusao',
}

@Entity('logs_auditoria')
export class LogAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  entidade!: string;

  @Column({ type: 'varchar', length: 80 })
  entidade_id!: string;

  @Column({ type: 'enum', enum: AcaoAuditoria })
  acao!: AcaoAuditoria;

  @Column({ type: 'jsonb', nullable: true })
  dados_anteriores!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  dados_novos!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 80 })
  usuario_id!: string;

  @Column({ type: 'varchar', length: 180 })
  usuario_nome!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;
}
