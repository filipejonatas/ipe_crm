import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { Repository } from 'typeorm';
import { FiltrarAuditoriaDto } from './dto/filtrar-auditoria.dto';
import { RegistrarAuditoriaDto } from './dto/registrar-auditoria.dto';
import { RespostaAuditoriaDto } from './dto/resposta-auditoria.dto';
import { LogAuditoria } from './log-auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(LogAuditoria)
    private readonly auditoriaRepository: Repository<LogAuditoria>,
  ) {}

  async registrar(dto: RegistrarAuditoriaDto): Promise<RespostaAuditoriaDto> {
    const log = this.auditoriaRepository.create({
      ...dto,
      dados_anteriores: dto.dados_anteriores ?? null,
      dados_novos: dto.dados_novos ?? null,
    });

    return this.paraResposta(await this.auditoriaRepository.save(log));
  }

  async listar(filtros: FiltrarAuditoriaDto): Promise<RespostaPaginada<RespostaAuditoriaDto>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.auditoriaRepository.createQueryBuilder('log');

    if (filtros.entidade)
      query.andWhere('log.entidade = :entidade', { entidade: filtros.entidade });
    if (filtros.acao) query.andWhere('log.acao = :acao', { acao: filtros.acao });
    if (filtros.usuario_id) {
      query.andWhere('log.usuario_id = :usuario_id', { usuario_id: filtros.usuario_id });
    }
    if (filtros.data_inicio) {
      query.andWhere('log.criado_em >= :data_inicio', { data_inicio: filtros.data_inicio });
    }
    if (filtros.data_fim)
      query.andWhere('log.criado_em <= :data_fim', { data_fim: filtros.data_fim });

    const [logs, total] = await query
      .orderBy('log.criado_em', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { dados: logs.map((log) => this.paraResposta(log)), total, pagina, limite };
  }

  async buscarPorId(id: string): Promise<RespostaAuditoriaDto> {
    const log = await this.auditoriaRepository.findOne({ where: { id } });

    if (!log) {
      throw new NotFoundException('Log de auditoria nao encontrado');
    }

    return this.paraResposta(log);
  }

  private paraResposta(log: LogAuditoria): RespostaAuditoriaDto {
    return {
      id: log.id,
      entidade: log.entidade,
      entidade_id: log.entidade_id,
      acao: log.acao,
      dados_anteriores: log.dados_anteriores,
      dados_novos: log.dados_novos,
      usuario_id: log.usuario_id,
      usuario_nome: log.usuario_nome,
      criado_em: log.criado_em,
    };
  }
}
