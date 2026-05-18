import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Perfil } from '@ipe_crm/shared';

export enum PerfilUsuario {
  ADMIN = 'admin',
  COMPRAS = 'compras',
  OFICINA = 'oficina',
  ADMINISTRATIVO = 'administrativo',
  GERENTE = 'gerente',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  nome!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  senha_hash!: string;

  @Column({ type: 'enum', enum: PerfilUsuario })
  perfil!: Perfil;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizado_em!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  excluido_em!: Date | null;
}
