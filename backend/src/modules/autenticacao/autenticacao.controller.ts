import { Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Perfil } from '@ipe_crm/shared';
import { GuardJwt, GuardLocal } from '../../common';
import { AutenticacaoService } from './autenticacao.service';

interface RequisicaoAutenticada {
  user: {
    id: string;
    nome?: string;
    email: string;
    perfil: Perfil;
  };
}

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(GuardLocal)
  login(@Req() request: RequisicaoAutenticada) {
    return this.autenticacaoService.login({
      id: request.user.id,
      nome: request.user.nome ?? '',
      email: request.user.email,
      perfil: request.user.perfil,
    });
  }

  @Get('eu')
  @UseGuards(GuardJwt)
  eu(@Req() request: RequisicaoAutenticada) {
    return request.user;
  }
}
