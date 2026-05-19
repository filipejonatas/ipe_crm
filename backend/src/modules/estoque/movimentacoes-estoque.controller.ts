import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { FiltrarMovimentacoesEstoqueDto } from './dto/filtrar-movimentacoes-estoque.dto';
import { RegistrarAjusteEstoqueDto } from './dto/registrar-ajuste-estoque.dto';
import { RegistrarSaidaEstoqueDto } from './dto/registrar-saida-estoque.dto';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('movimentacoes-estoque')
export class MovimentacoesEstoqueController {
  constructor(private readonly movimentacoesEstoqueService: MovimentacoesEstoqueService) {}

  @Post('saida')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA)
  registrarSaida(@Body() dto: RegistrarSaidaEstoqueDto, @Req() request: RequestComUsuario) {
    return this.movimentacoesEstoqueService.registrarSaida(dto, request.user);
  }

  @Post('ajuste')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.GERENTE)
  registrarAjuste(@Body() dto: RegistrarAjusteEstoqueDto, @Req() request: RequestComUsuario) {
    return this.movimentacoesEstoqueService.registrarAjuste(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.OFICINA, PERFIS.COMPRAS, PERFIS.GERENTE)
  listar(@Query() filtros: FiltrarMovimentacoesEstoqueDto) {
    return this.movimentacoesEstoqueService.listar(filtros);
  }
}
