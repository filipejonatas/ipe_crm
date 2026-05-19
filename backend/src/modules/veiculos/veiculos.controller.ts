import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { FiltrarVeiculoDto } from './dto/filtrar-veiculo.dto';
import { VeiculosService } from './veiculos.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @RotaProtegida(PERFIS.ADMIN)
  criar(@Body() dto: CriarVeiculoDto, @Req() request: RequestComUsuario) {
    return this.veiculosService.criar(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  listar(@Query() filtros: FiltrarVeiculoDto) {
    return this.veiculosService.listar(filtros);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  buscarPorId(@Param('id') id: string) {
    return this.veiculosService.buscarPorId(id);
  }

  @Patch(':id')
  @RotaProtegida(PERFIS.ADMIN)
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarVeiculoDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.veiculosService.atualizar(id, dto, request.user);
  }

  @Delete(':id')
  @RotaProtegida(PERFIS.ADMIN)
  remover(@Param('id') id: string, @Req() request: RequestComUsuario) {
    return this.veiculosService.remover(id, request.user);
  }
}
