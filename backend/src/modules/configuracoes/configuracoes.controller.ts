import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import { RotaProtegida } from '../../common';
import { ConfiguracoesService } from './configuracoes.service';
import { AtualizarConfiguracaoDto } from './dto/atualizar-configuracao.dto';

@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Get()
  @RotaProtegida(PERFIS.ADMIN)
  listar() {
    return this.configuracoesService.listar();
  }

  @Get(':chave')
  @RotaProtegida(PERFIS.ADMIN)
  buscarPorChave(@Param('chave') chave: string) {
    return this.configuracoesService.buscarPorChave(chave);
  }

  @Patch(':chave')
  @RotaProtegida(PERFIS.ADMIN)
  atualizar(@Param('chave') chave: string, @Body() dto: AtualizarConfiguracaoDto) {
    return this.configuracoesService.atualizar(chave, dto);
  }
}
