import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { AtualizarManutencaoVeiculoDto } from './dto/atualizar-manutencao-veiculo.dto';
import { CriarManutencaoVeiculoDto } from './dto/criar-manutencao-veiculo.dto';
import { FiltrarManutencoesVeiculoDto } from './dto/filtrar-manutencoes-veiculo.dto';
import { ManutencoesVeiculoService } from './manutencoes-veiculo.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('manutencoes-veiculos')
export class ManutencoesVeiculoController {
  constructor(private readonly manutencoesVeiculoService: ManutencoesVeiculoService) {}

  @Post()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  criar(@Body() dto: CriarManutencaoVeiculoDto, @Req() request: RequestComUsuario) {
    return this.manutencoesVeiculoService.criar(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  listar(@Query() filtros: FiltrarManutencoesVeiculoDto) {
    return this.manutencoesVeiculoService.listar(filtros);
  }

  @Get('trocas-oleo')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  listarTrocasOleo(@Query() filtros: FiltrarManutencoesVeiculoDto) {
    return this.manutencoesVeiculoService.listar(filtros, true);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  buscarPorId(@Param('id') id: string) {
    return this.manutencoesVeiculoService.buscarPorId(id);
  }

  @Patch(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarManutencaoVeiculoDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.manutencoesVeiculoService.atualizar(id, dto, request.user);
  }

  @Delete(':id')
  @RotaProtegida(PERFIS.ADMIN)
  remover(@Param('id') id: string, @Req() request: RequestComUsuario) {
    return this.manutencoesVeiculoService.remover(id, request.user);
  }
}
