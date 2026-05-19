import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { UsuarioAuditoria, UsuariosService } from './usuarios.service';

interface RequestComUsuario {
  user?: UsuarioAuditoria;
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @RotaProtegida(PERFIS.ADMIN)
  criar(@Body() dto: CriarUsuarioDto, @Req() request: RequestComUsuario) {
    return this.usuariosService.criar(dto, request.user);
  }

  @Get()
  @RotaProtegida(PERFIS.ADMIN)
  listar(@Query('pagina') pagina?: number, @Query('limite') limite?: number) {
    return this.usuariosService.listar(pagina, limite);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN)
  buscarPorId(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  @Patch(':id')
  @RotaProtegida(PERFIS.ADMIN)
  atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarUsuarioDto,
    @Req() request: RequestComUsuario,
  ) {
    return this.usuariosService.atualizar(id, dto, request.user);
  }

  @Delete(':id')
  @RotaProtegida(PERFIS.ADMIN)
  remover(@Param('id') id: string, @Req() request: RequestComUsuario) {
    return this.usuariosService.remover(id, request.user);
  }
}
