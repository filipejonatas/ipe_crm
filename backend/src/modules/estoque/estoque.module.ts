import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { Usuario } from '../usuarios/usuario.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { ItemEstoque } from './entities/item-estoque.entity';
import { ItemEstoqueVeiculo } from './entities/item-estoque-veiculo.entity';
import { MovimentacaoEstoque } from './entities/movimentacao-estoque.entity';
import { ItensEstoqueController } from './itens-estoque.controller';
import { ItensEstoqueService } from './itens-estoque.service';
import { MovimentacoesEstoqueController } from './movimentacoes-estoque.controller';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemEstoque,
      ItemEstoqueVeiculo,
      MovimentacaoEstoque,
      Veiculo,
      Usuario,
    ]),
    AuditoriaModule,
  ],
  controllers: [ItensEstoqueController, MovimentacoesEstoqueController],
  providers: [ItensEstoqueService, MovimentacoesEstoqueService],
  exports: [ItensEstoqueService, MovimentacoesEstoqueService],
})
export class EstoqueModule {}
