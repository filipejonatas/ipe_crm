import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaItemEstoque } from './categoria-item-estoque.enum';
import { ItemEstoqueVeiculo } from './item-estoque-veiculo.entity';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity';

@Entity('itens_estoque')
@Check('"saldo_atual" >= 0')
@Check('"estoque_minimo" >= 0')
export class ItemEstoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true, where: 'excluido_em IS NULL' })
  @Column({ type: 'varchar', length: 60, nullable: true })
  codigo!: string | null;

  @Column({ type: 'varchar', length: 180 })
  descricao!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  marca!: string | null;

  @Index()
  @Column({ type: 'enum', enum: CategoriaItemEstoque })
  categoria!: CategoriaItemEstoque;

  @Column({ type: 'varchar', length: 20, default: 'un' })
  unidade_medida!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  saldo_atual!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  estoque_minimo!: number;

  @Index()
  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizado_em!: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  excluido_em!: Date | null;

  @OneToMany(() => ItemEstoqueVeiculo, (compatibilidade) => compatibilidade.item_estoque)
  veiculos_compativeis?: ItemEstoqueVeiculo[];

  @OneToMany(() => MovimentacaoEstoque, (movimentacao) => movimentacao.item_estoque)
  movimentacoes?: MovimentacaoEstoque[];
}
