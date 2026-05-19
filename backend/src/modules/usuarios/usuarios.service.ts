import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { RespostaUsuarioDto } from './dto/resposta-usuario.dto';
import { Usuario } from './usuario.entity';

export interface UsuarioAuditoria {
  id: string;
  nome?: string;
  email?: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async criar(
    dto: CriarUsuarioDto,
    usuarioAuditoria?: UsuarioAuditoria,
  ): Promise<RespostaUsuarioDto> {
    const senha_hash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuariosRepository.create({
      nome: dto.nome,
      email: dto.email,
      senha_hash,
      perfil: dto.perfil,
    });

    const salvo = await this.usuariosRepository.save(usuario);
    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, salvo, null, salvo, usuarioAuditoria);
    return this.paraResposta(salvo);
  }

  async listar(pagina = 1, limite = 10): Promise<RespostaPaginada<RespostaUsuarioDto>> {
    const paginaNormalizada = Math.max(Number(pagina) || 1, 1);
    const limiteNormalizado = Math.min(Math.max(Number(limite) || 10, 1), 100);

    const [usuarios, total] = await this.usuariosRepository.findAndCount({
      where: { excluido_em: IsNull() },
      order: { criado_em: 'DESC' },
      skip: (paginaNormalizada - 1) * limiteNormalizado,
      take: limiteNormalizado,
    });

    return {
      dados: usuarios.map((usuario) => this.paraResposta(usuario)),
      total,
      pagina: paginaNormalizada,
      limite: limiteNormalizado,
    };
  }

  async buscarPorId(id: string): Promise<RespostaUsuarioDto> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return this.paraResposta(usuario);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.senha_hash')
      .where('usuario.email = :email', { email })
      .andWhere('usuario.excluido_em IS NULL')
      .getOne();
  }

  async atualizar(
    id: string,
    dto: AtualizarUsuarioDto,
    usuarioAuditoria?: UsuarioAuditoria,
  ): Promise<RespostaUsuarioDto> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const dadosAnteriores = this.paraObjetoAuditoria(usuario);
    if (dto.nome !== undefined) usuario.nome = dto.nome;
    if (dto.perfil !== undefined) usuario.perfil = dto.perfil;
    if (dto.ativo !== undefined) usuario.ativo = dto.ativo;

    const salvo = await this.usuariosRepository.save(usuario);
    await this.registrarAuditoria(
      AcaoAuditoria.EDICAO,
      salvo,
      dadosAnteriores,
      salvo,
      usuarioAuditoria,
    );
    return this.paraResposta(salvo);
  }

  async remover(id: string, usuarioAuditoria?: UsuarioAuditoria): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const dadosAnteriores = this.paraObjetoAuditoria(usuario);
    usuario.excluido_em = new Date();
    await this.usuariosRepository.save(usuario);
    await this.registrarAuditoria(
      AcaoAuditoria.EXCLUSAO,
      usuario,
      dadosAnteriores,
      null,
      usuarioAuditoria,
    );
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    usuarioAlterado: Usuario,
    dados_anteriores: Record<string, unknown> | null,
    dados_novos: Usuario | null,
    usuarioAuditoria?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuarioAuditoria?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'usuario',
      entidade_id: usuarioAlterado.id,
      acao,
      dados_anteriores,
      dados_novos: dados_novos ? this.paraObjetoAuditoria(dados_novos) : null,
      usuario_id: usuarioAuditoria.id,
      usuario_nome: usuarioAuditoria.nome ?? usuarioAuditoria.email ?? usuarioAuditoria.id,
    });
  }

  private paraObjetoAuditoria(usuario: Usuario): Record<string, unknown> {
    return { ...this.paraResposta(usuario) };
  }

  private paraResposta(usuario: Usuario): RespostaUsuarioDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      criado_em: usuario.criado_em,
      atualizado_em: usuario.atualizado_em,
      excluido_em: usuario.excluido_em,
    };
  }
}
