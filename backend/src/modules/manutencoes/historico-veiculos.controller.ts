import { Controller, Get, Param, Query } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import { FiltrarManutencoesVeiculoDto } from './dto/filtrar-manutencoes-veiculo.dto';
import { ManutencoesVeiculoService } from './manutencoes-veiculo.service';

@Controller('veiculos')
export class HistoricoVeiculosController {
  constructor(private readonly manutencoesVeiculoService: ManutencoesVeiculoService) {}

  @Get(':id/manutencoes')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  listarPorVeiculo(@Param('id') id: string, @Query() filtros: FiltrarManutencoesVeiculoDto) {
    return this.manutencoesVeiculoService.listarPorVeiculo(id, filtros);
  }

  @Get('placa/:placa/manutencoes')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  listarPorPlaca(@Param('placa') placa: string, @Query() filtros: FiltrarManutencoesVeiculoDto) {
    return this.manutencoesVeiculoService.listarPorPlaca(placa, filtros);
  }
}
