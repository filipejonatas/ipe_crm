import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { DataSource, IsNull, Repository } from 'typeorm';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { Usuario } from '../usuarios/usuario.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { FiltrarMovimentacoesEstoqueDto } from './dto/filtrar-movimentacoes-estoque.dto';
import { RegistrarAjusteEstoqueDto } from './dto/registrar-ajuste-estoque.dto';
import { RegistrarSaidaEstoqueDto } from './dto/registrar-saida-estoque.dto';
import { CategoriaItemEstoque } from './entities/categoria-item-estoque.enum';
import { ItemEstoque } from './entities/item-estoque.entity';
import { ItemEstoqueVeiculo } from './entities/item-estoque-veiculo.entity';
import { MovimentacaoEstoque } from './entities/movimentacao-estoque.entity';
import { OrigemMovimentacaoEstoque } from './entities/origem-movimentacao-estoque.enum';
import { TipoMovimentacaoEstoque } from './entities/tipo-movimentacao-estoque.enum';

interface RegistrarEntradaParams {
  item_estoque_id: string;
  quantidade: number;
  origem: OrigemMovimentacaoEstoque;
  usuarioAtual?: UsuarioAuditoria;
  observacoes?: string;
}

@Injectable()
export class MovimentacoesEstoqueService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(MovimentacaoEstoque)
    private readonly movimentacoesRepository: Repository<MovimentacaoEstoque>,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async registrarEntrada(params: RegistrarEntradaParams) {
    if (params.quantidade <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');

    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(ItemEstoque, {
        where: { id: params.item_estoque_id, excluido_em: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) throw new NotFoundException('Item de estoque nao encontrado');

      const saldoAnterior = Number(item.saldo_atual);
      const saldoPosterior = saldoAnterior + Number(params.quantidade);
      const movimentacao = manager.create(MovimentacaoEstoque, {
        item_estoque: item,
        tipo: TipoMovimentacaoEstoque.ENTRADA,
        origem: params.origem,
        quantidade: params.quantidade,
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoPosterior,
        usuario: { id: params.usuarioAtual?.id } as Usuario,
        veiculo: null,
        observacoes: params.observacoes ?? null,
      });
      item.saldo_atual = saldoPosterior;
      await manager.save(item);
      return manager.save(movimentacao);
    });
  }

  async registrarSaida(dto: RegistrarSaidaEstoqueDto, usuario?: UsuarioAuditoria) {
    if (dto.quantidade <= 0) throw new BadRequestException('Quantidade deve ser maior que zero');

    const movimentacao = await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(ItemEstoque, {
        where: { id: dto.item_estoque_id, ativo: true, excluido_em: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) throw new NotFoundException('Item de estoque nao encontrado');

      if (item.categoria === CategoriaItemEstoque.FILTRO && !dto.veiculo_id) {
        throw new BadRequestException('Saida de filtro exige veiculo informado');
      }

      let veiculo: Veiculo | null = null;
      if (dto.veiculo_id) {
        veiculo = await manager.findOne(Veiculo, {
          where: { id: dto.veiculo_id, ativo: true, excluido_em: IsNull() },
        });
        if (!veiculo) throw new NotFoundException('Veiculo nao encontrado');

        const possuiVinculos = await manager.count(ItemEstoqueVeiculo, {
          where: { item_estoque: { id: item.id } },
        });
        if (possuiVinculos > 0) {
          const compativel = await manager.findOne(ItemEstoqueVeiculo, {
            where: { item_estoque: { id: item.id }, veiculo: { id: dto.veiculo_id } },
          });
          if (!compativel)
            throw new BadRequestException('Item nao compativel com o veiculo informado');
        }
      }

      const saldoAnterior = Number(item.saldo_atual);
      const saldoPosterior = saldoAnterior - Number(dto.quantidade);
      if (saldoPosterior < 0) throw new BadRequestException('Saldo insuficiente');

      const movimentacaoSaida = manager.create(MovimentacaoEstoque, {
        item_estoque: item,
        tipo: TipoMovimentacaoEstoque.SAIDA,
        origem: OrigemMovimentacaoEstoque.UTILIZACAO_OFICINA,
        quantidade: dto.quantidade,
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoPosterior,
        veiculo,
        usuario: { id: usuario?.id } as Usuario,
        observacoes: dto.observacoes ?? null,
      });
      item.saldo_atual = saldoPosterior;
      await manager.save(item);
      return manager.save(movimentacaoSaida);
    });

    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, movimentacao, usuario);
    return movimentacao;
  }

  async registrarAjuste(dto: RegistrarAjusteEstoqueDto, usuario?: UsuarioAuditoria) {
    if (dto.novo_saldo < 0) throw new BadRequestException('Novo saldo nao pode ser negativo');

    const movimentacao = await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(ItemEstoque, {
        where: { id: dto.item_estoque_id, ativo: true, excluido_em: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) throw new NotFoundException('Item de estoque nao encontrado');

      const saldoAnterior = Number(item.saldo_atual);
      const saldoPosterior = Number(dto.novo_saldo);
      if (saldoAnterior === saldoPosterior) {
        throw new BadRequestException('Novo saldo deve ser diferente do saldo atual');
      }

      const ajuste = manager.create(MovimentacaoEstoque, {
        item_estoque: item,
        tipo: TipoMovimentacaoEstoque.AJUSTE,
        origem: OrigemMovimentacaoEstoque.AJUSTE_MANUAL,
        quantidade: Math.abs(saldoPosterior - saldoAnterior),
        saldo_anterior: saldoAnterior,
        saldo_posterior: saldoPosterior,
        veiculo: null,
        usuario: { id: usuario?.id } as Usuario,
        observacoes: dto.motivo,
      });
      item.saldo_atual = saldoPosterior;
      await manager.save(item);
      return manager.save(ajuste);
    });

    await this.registrarAuditoria(AcaoAuditoria.EDICAO, movimentacao, usuario);
    return movimentacao;
  }

  async listar(
    filtros: FiltrarMovimentacoesEstoqueDto = {},
  ): Promise<RespostaPaginada<MovimentacaoEstoque>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.movimentacoesRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.item_estoque', 'item')
      .leftJoinAndSelect('movimentacao.veiculo', 'veiculo')
      .leftJoinAndSelect('movimentacao.usuario', 'usuario');

    if (filtros.item_estoque_id) {
      query.andWhere('item.id = :item_estoque_id', filtros);
    }
    if (filtros.tipo) query.andWhere('movimentacao.tipo = :tipo', filtros);
    if (filtros.origem) query.andWhere('movimentacao.origem = :origem', filtros);
    if (filtros.veiculo_id) query.andWhere('veiculo.id = :veiculo_id', filtros);
    if (filtros.usuario_id) query.andWhere('usuario.id = :usuario_id', filtros);
    if (filtros.data_inicio) {
      query.andWhere('movimentacao.criado_em >= :data_inicio', filtros);
    }
    if (filtros.data_fim) {
      query.andWhere('movimentacao.criado_em <= :data_fim', filtros);
    }

    const [movimentacoes, total] = await query
      .orderBy('movimentacao.criado_em', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return {
      dados: movimentacoes.map((movimentacao) => this.paraResposta(movimentacao)),
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
    };
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    movimentacao: MovimentacaoEstoque,
    usuario?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuario?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'movimentacao_estoque',
      entidade_id: movimentacao.id,
      acao,
      dados_anteriores: null,
      dados_novos: this.paraResposta(movimentacao) as unknown as Record<string, unknown>,
      usuario_id: usuario.id,
      usuario_nome: usuario.nome ?? usuario.email ?? usuario.id,
    });
  }

  private paraResposta(movimentacao: MovimentacaoEstoque): MovimentacaoEstoque {
    return {
      ...movimentacao,
      quantidade: Number(movimentacao.quantidade),
      saldo_anterior: Number(movimentacao.saldo_anterior),
      saldo_posterior: Number(movimentacao.saldo_posterior),
    };
  }
}
