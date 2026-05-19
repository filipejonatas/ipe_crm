import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import { AtualizarFornecedorDto } from './dto/atualizar-fornecedor.dto';
import { CriarFornecedorDto } from './dto/criar-fornecedor.dto';
import { FiltrarFornecedorDto } from './dto/filtrar-fornecedor.dto';
import { FornecedoresService, UsuarioAuditoria } from './fornecedores.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.COMPRAS)
  criar(@Body() dto: CriarFornecedorDto, @Req() request: RequestComUsuario) {
    return this.fornecedoresService.criar(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE)
  listar(@Query() filtros: FiltrarFornecedorDto) {
    return this.fornecedoresService.listar(filtros);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.COMPRAS, PERFIS.ADMINISTRATIVO, PERFIS.GERENTE)
  buscarPorId(@Param('id') id: string) {
    return this.fornecedoresService.buscarPorId(id);
  }

  @Patch(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.COMPRAS)
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarFornecedorDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.fornecedoresService.atualizar(id, dto, request.user);
  }

  @Delete(':id')
  @RotaProtegida(PERFIS.ADMIN)
  remover(@Param('id') id: string, @Req() request: RequestComUsuario) {
    return this.fornecedoresService.remover(id, request.user);
  }
}
