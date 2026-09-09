import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/usuario.entity';
import { Veiculo } from '../../veiculos/veiculo.entity';
import { ManutencaoPeca } from './manutencao-peca.entity';

@Entity('manutencoes_veiculo')
export class ManutencaoVeiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: 'veiculo_id' })
  veiculo!: Veiculo;

  @Index()
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Index()
  @Column({ type: 'date' })
  data_manutencao!: string;

  @Column({ type: 'boolean', default: false })
  troca_oleo!: boolean;

  @Column({ type: 'date', nullable: true })
  proxima_troca_oleo!: string | null;

  @Column({ type: 'integer', nullable: true })
  proxima_troca_oleo_km!: number | null;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  placa_snapshot!: string;

  @Column({ type: 'text' })
  descricao!: string;

  @Column({ type: 'integer', nullable: true })
  quilometragem!: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  custo_mao_obra!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  custo_total!: number;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizado_em!: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  excluido_em!: Date | null;

  @OneToMany(() => ManutencaoPeca, (peca) => peca.manutencao)
  pecas?: ManutencaoPeca[];
}
