import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Veiculo } from '../../veiculos/veiculo.entity';
import { ItemEstoque } from './item-estoque.entity';

@Entity('item_estoque_veiculos')
@Index(['item_estoque', 'veiculo'], { unique: true })
export class ItemEstoqueVeiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ItemEstoque, (item) => item.veiculos_compativeis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_estoque_id' })
  item_estoque!: ItemEstoque;

  @ManyToOne(() => Veiculo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'veiculo_id' })
  veiculo!: Veiculo;

  @CreateDateColumn({ type: 'timestamptz' })
  criado_em!: Date;
}
