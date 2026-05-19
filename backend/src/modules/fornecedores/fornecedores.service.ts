import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { Brackets, IsNull, Repository } from 'typeorm';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AtualizarFornecedorDto } from './dto/atualizar-fornecedor.dto';
import { CriarFornecedorDto } from './dto/criar-fornecedor.dto';
import { FiltrarFornecedorDto } from './dto/filtrar-fornecedor.dto';
import { RespostaFornecedorDto } from './dto/resposta-fornecedor.dto';
import { Fornecedor } from './fornecedor.entity';

export interface UsuarioAuditoria {
  id: string;
  nome?: string;
  email?: string;
}

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedoresRepository: Repository<Fornecedor>,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async criar(dto: CriarFornecedorDto, usuario?: UsuarioAuditoria): Promise<RespostaFornecedorDto> {
    const fornecedor = this.fornecedoresRepository.create(dto);
    const salvo = await this.fornecedoresRepository.save(fornecedor);
    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, salvo, null, salvo, usuario);
    return this.paraResposta(salvo);
  }

  async listar(
    filtros: FiltrarFornecedorDto = {},
  ): Promise<RespostaPaginada<RespostaFornecedorDto>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.fornecedoresRepository
      .createQueryBuilder('fornecedor')
      .where('fornecedor.excluido_em IS NULL');

    if (filtros.busca) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('fornecedor.razao_social ILIKE :busca', { busca: `%${filtros.busca}%` }).orWhere(
            'fornecedor.nome_fantasia ILIKE :busca',
            { busca: `%${filtros.busca}%` },
          );
        }),
      );
    }

    if (filtros.ativo !== undefined) {
      query.andWhere('fornecedor.ativo = :ativo', { ativo: filtros.ativo });
    }

    const [fornecedores, total] = await query
      .orderBy('fornecedor.criado_em', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { dados: fornecedores.map((item) => this.paraResposta(item)), total, pagina, limite };
  }

  async buscarPorId(id: string): Promise<RespostaFornecedorDto> {
    return this.paraResposta(await this.buscarEntidadePorId(id));
  }

  async atualizar(
    id: string,
    dto: AtualizarFornecedorDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaFornecedorDto> {
    const fornecedor = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(fornecedor);

    Object.assign(fornecedor, dto);
    const salvo = await this.fornecedoresRepository.save(fornecedor);
    await this.registrarAuditoria(AcaoAuditoria.EDICAO, salvo, dadosAnteriores, salvo, usuario);
    return this.paraResposta(salvo);
  }

  async remover(id: string, usuario?: UsuarioAuditoria): Promise<void> {
    const fornecedor = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(fornecedor);
    fornecedor.excluido_em = new Date();
    await this.fornecedoresRepository.save(fornecedor);
    await this.registrarAuditoria(
      AcaoAuditoria.EXCLUSAO,
      fornecedor,
      dadosAnteriores,
      null,
      usuario,
    );
  }

  private async buscarEntidadePorId(id: string): Promise<Fornecedor> {
    const fornecedor = await this.fornecedoresRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor nao encontrado');
    }

    return fornecedor;
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    fornecedor: Fornecedor,
    dados_anteriores: Record<string, unknown> | null,
    dados_novos: Fornecedor | null,
    usuario?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuario?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'fornecedor',
      entidade_id: fornecedor.id,
      acao,
      dados_anteriores,
      dados_novos: dados_novos ? this.paraObjetoAuditoria(dados_novos) : null,
      usuario_id: usuario.id,
      usuario_nome: usuario.nome ?? usuario.email ?? usuario.id,
    });
  }

  private paraObjetoAuditoria(fornecedor: Fornecedor): Record<string, unknown> {
    return { ...this.paraResposta(fornecedor), excluido_em: fornecedor.excluido_em };
  }

  private paraResposta(fornecedor: Fornecedor): RespostaFornecedorDto {
    return {
      id: fornecedor.id,
      razao_social: fornecedor.razao_social,
      nome_fantasia: fornecedor.nome_fantasia,
      cnpj: fornecedor.cnpj,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
      observacoes: fornecedor.observacoes,
      ativo: fornecedor.ativo,
      criado_em: fornecedor.criado_em,
      atualizado_em: fornecedor.atualizado_em,
    };
  }
}
