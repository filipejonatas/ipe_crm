import { Controller, Get, Param, Query } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import { AuditoriaService } from './auditoria.service';
import { FiltrarAuditoriaDto } from './dto/filtrar-auditoria.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @RotaProtegida(PERFIS.ADMIN, PERFIS.GERENTE)
  listar(@Query() filtros: FiltrarAuditoriaDto) {
    return this.auditoriaService.listar(filtros);
  }

  @Get(':id')
  @RotaProtegida(PERFIS.ADMIN, PERFIS.GERENTE)
  buscarPorId(@Param('id') id: string) {
    return this.auditoriaService.buscarPorId(id);
  }
}
