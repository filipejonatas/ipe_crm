import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { RespostaUsuarioDto } from './dto/resposta-usuario.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async criar(dto: CriarUsuarioDto): Promise<RespostaUsuarioDto> {
    const senha_hash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuariosRepository.create({
      nome: dto.nome,
      email: dto.email,
      senha_hash,
      perfil: dto.perfil,
    });

    const salvo = await this.usuariosRepository.save(usuario);
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

  async atualizar(id: string, dto: AtualizarUsuarioDto): Promise<RespostaUsuarioDto> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (dto.nome !== undefined) usuario.nome = dto.nome;
    if (dto.perfil !== undefined) usuario.perfil = dto.perfil;
    if (dto.ativo !== undefined) usuario.ativo = dto.ativo;

    return this.paraResposta(await this.usuariosRepository.save(usuario));
  }

  async remover(id: string): Promise<void> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    usuario.excluido_em = new Date();
    await this.usuariosRepository.save(usuario);
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
