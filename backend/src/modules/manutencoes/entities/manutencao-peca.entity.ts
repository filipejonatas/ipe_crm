import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemEstoque } from '../../estoque/entities/item-estoque.entity';
import { MovimentacaoEstoque } from '../../estoque/entities/movimentacao-estoque.entity';
import { ManutencaoVeiculo } from './manutencao-veiculo.entity';

@Entity('manutencao_pecas')
export class ManutencaoPeca {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => ManutencaoVeiculo, (manutencao) => manutencao.pecas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'manutencao_id' })
  manutencao!: ManutencaoVeiculo;

  @Index()
  @ManyToOne(() => ItemEstoque, { nullable: true })
  @JoinColumn({ name: 'item_estoque_id' })
  item_estoque!: ItemEstoque | null;

  @ManyToOne(() => MovimentacaoEstoque, { nullable: true })
  @JoinColumn({ name: 'movimentacao_estoque_id' })
  movimentacao_estoque!: MovimentacaoEstoque | null;

  @Column({ type: 'varchar', length: 180 })
  descricao_peca!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  preco_unitario!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor_total!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;
}
