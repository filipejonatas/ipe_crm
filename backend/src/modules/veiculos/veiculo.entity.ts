import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('veiculos')
export class Veiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  placa!: string;

  @Column({ type: 'varchar', length: 120 })
  modelo!: string;

  @Column({ type: 'varchar', length: 120 })
  marca!: string;

  @Column({ type: 'integer', nullable: true })
  ano!: number | null;

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
