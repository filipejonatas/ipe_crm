import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { FiltrarMovimentacoesEstoqueDto } from './dto/filtrar-movimentacoes-estoque.dto';
import { AtualizarItemEstoqueDto } from './dto/atualizar-item-estoque.dto';
import { CriarItemEstoqueDto } from './dto/criar-item-estoque.dto';
import { FiltrarItensEstoqueDto } from './dto/filtrar-itens-estoque.dto';
import { VincularVeiculosItemDto } from './dto/vincular-veiculos-item.dto';
import { ItensEstoqueService } from './itens-estoque.service';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('itens-estoque')
export class ItensEstoqueController {
  constructor(
    private readonly itensEstoqueService: ItensEstoqueService,
    private readonly movimentacoesEstoqueService: MovimentacoesEstoqueService,
  ) {}

  @Post()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS)
  criar(@Body() dto: CriarItemEstoqueDto, @Req() request: RequestComUsuario) {
    return this.itensEstoqueService.criar(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  listar(@Query() filtros: FiltrarItensEstoqueDto) {
    return this.itensEstoqueService.listar(filtros);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  buscarPorId(@Param('id') id: string) {
    return this.itensEstoqueService.buscarPorId(id);
  }

  @Patch(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS)
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarItemEstoqueDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.itensEstoqueService.atualizar(id, dto, request.user);
  }

  @Delete(':id')
  @RotaProtegida(PERFIS.ADMIN)
  remover(@Param('id') id: string, @Req() request: RequestComUsuario) {
    return this.itensEstoqueService.remover(id, request.user);
  }

  @Put(':id/veiculos')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  vincularVeiculos(
    @Param('id') id: string,
    @Body() dto: VincularVeiculosItemDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.itensEstoqueService.vincularVeiculos(id, dto, request.user);
  }

  @Get(':id/veiculos')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  listarVeiculosCompativeis(@Param('id') id: string) {
    return this.itensEstoqueService.listarVeiculosCompativeis(id);
  }

  @Get(':id/movimentacoes')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  listarMovimentacoes(@Param('id') id: string, @Query() filtros: FiltrarMovimentacoesEstoqueDto) {
    return this.movimentacoesEstoqueService.listar({ ...filtros, item_estoque_id: id });
  }
}
