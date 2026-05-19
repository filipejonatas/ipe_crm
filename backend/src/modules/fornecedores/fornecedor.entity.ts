import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 180 })
  razao_social!: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  nome_fantasia!: string | null;

  @Column({ type: 'varchar', length: 18, unique: true, nullable: true })
  cnpj!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizado_em!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  excluido_em!: Date | null;
}
