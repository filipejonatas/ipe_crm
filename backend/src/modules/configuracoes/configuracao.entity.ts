import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('configuracoes')
export class Configuracao {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  chave!: string;

  @Column({ type: 'varchar', length: 255 })
  valor!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizado_em!: Date;
}
