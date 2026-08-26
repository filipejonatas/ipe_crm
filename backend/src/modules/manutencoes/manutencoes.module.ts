import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ItemEstoque } from '../estoque/entities/item-estoque.entity';
import { MovimentacaoEstoque } from '../estoque/entities/movimentacao-estoque.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { ManutencaoPeca } from './entities/manutencao-peca.entity';
import { ManutencaoVeiculo } from './entities/manutencao-veiculo.entity';
import { HistoricoVeiculosController } from './historico-veiculos.controller';
import { ManutencoesVeiculoController } from './manutencoes-veiculo.controller';
import { ManutencoesVeiculoService } from './manutencoes-veiculo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ManutencaoVeiculo,
      ManutencaoPeca,
      Veiculo,
      Usuario,
      ItemEstoque,
      MovimentacaoEstoque,
    ]),
    AuditoriaModule,
  ],
  controllers: [ManutencoesVeiculoController, HistoricoVeiculosController],
  providers: [ManutencoesVeiculoService],
  exports: [ManutencoesVeiculoService],
})
export class ManutencoesModule {}
