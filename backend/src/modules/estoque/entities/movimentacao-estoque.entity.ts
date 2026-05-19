import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/usuario.entity';
import { Veiculo } from '../../veiculos/veiculo.entity';
import { ItemEstoque } from './item-estoque.entity';
import { OrigemMovimentacaoEstoque } from './origem-movimentacao-estoque.enum';
import { TipoMovimentacaoEstoque } from './tipo-movimentacao-estoque.enum';

@Entity('movimentacoes_estoque')
@Check('"quantidade" > 0')
@Check('"saldo_anterior" >= 0')
@Check('"saldo_posterior" >= 0')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => ItemEstoque, (item) => item.movimentacoes)
  @JoinColumn({ name: 'item_estoque_id' })
  item_estoque!: ItemEstoque;

  @Index()
  @Column({ type: 'enum', enum: TipoMovimentacaoEstoque })
  tipo!: TipoMovimentacaoEstoque;

  @Index()
  @Column({ type: 'enum', enum: OrigemMovimentacaoEstoque })
  origem!: OrigemMovimentacaoEstoque;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  saldo_anterior!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  saldo_posterior!: number;

  @Index()
  @ManyToOne(() => Veiculo, { nullable: true })
  @JoinColumn({ name: 'veiculo_id' })
  veiculo!: Veiculo | null;

  @Index()
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;
}
