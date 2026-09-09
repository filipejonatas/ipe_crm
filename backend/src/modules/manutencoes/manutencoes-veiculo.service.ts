import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { ItemEstoque } from '../estoque/entities/item-estoque.entity';
import { MovimentacaoEstoque } from '../estoque/entities/movimentacao-estoque.entity';
import { OrigemMovimentacaoEstoque } from '../estoque/entities/origem-movimentacao-estoque.enum';
import { TipoMovimentacaoEstoque } from '../estoque/entities/tipo-movimentacao-estoque.enum';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { Usuario } from '../usuarios/usuario.entity';
import { Veiculo } from '../veiculos/veiculo.entity';
import { AtualizarManutencaoVeiculoDto } from './dto/atualizar-manutencao-veiculo.dto';
import { CriarManutencaoVeiculoDto } from './dto/criar-manutencao-veiculo.dto';
import { FiltrarManutencoesVeiculoDto } from './dto/filtrar-manutencoes-veiculo.dto';
import { PecaManutencaoDto } from './dto/peca-manutencao.dto';
import {
  RespostaManutencaoPecaDto,
  RespostaManutencaoVeiculoDto,
} from './dto/resposta-manutencao-veiculo.dto';
import { ManutencaoPeca } from './entities/manutencao-peca.entity';
import { ManutencaoVeiculo } from './entities/manutencao-veiculo.entity';

@Injectable()
export class ManutencoesVeiculoService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ManutencaoVeiculo)
    private readonly manutencoesRepository: Repository<ManutencaoVeiculo>,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async criar(
    dto: CriarManutencaoVeiculoDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaManutencaoVeiculoDto> {
    const proximaTroca = this.validarTrocaOleo(
      dto.troca_oleo ?? false,
      dto.proxima_troca_oleo,
      dto.data_manutencao,
    );
    const proximaKm = this.validarProximaKm(
      dto.troca_oleo ?? false,
      dto.proxima_troca_oleo_km,
      dto.quilometragem,
    );
    const manutencao = await this.dataSource.transaction(async (manager) => {
      const veiculo = await manager.findOne(Veiculo, {
        where: { id: dto.veiculo_id, ativo: true, excluido_em: IsNull() },
      });
      if (!veiculo) throw new NotFoundException('Veiculo nao encontrado');

      const pecasDto = dto.pecas ?? [];
      const custoPecas = pecasDto.reduce(
        (total, peca) => total + Number(peca.quantidade) * Number(peca.preco_unitario),
        0,
      );

      const manutencaoSalva = await manager.save(
        manager.create(ManutencaoVeiculo, {
          veiculo,
          usuario: { id: usuario?.id } as Usuario,
          data_manutencao: dto.data_manutencao,
          troca_oleo: dto.troca_oleo ?? false,
          proxima_troca_oleo: proximaTroca,
          proxima_troca_oleo_km: proximaKm,
          placa_snapshot: veiculo.placa,
          descricao: dto.descricao,
          quilometragem: dto.quilometragem ?? null,
          custo_mao_obra: dto.custo_mao_obra ?? 0,
          custo_total: Number(dto.custo_mao_obra ?? 0) + custoPecas,
          observacoes: this.normalizarTextoNullable(dto.observacoes),
        }),
      );

      for (const pecaDto of pecasDto) {
        let item: ItemEstoque | null = null;
        let movimentacao: MovimentacaoEstoque | null = null;
        let descricaoPeca = this.normalizarTextoNullable(pecaDto.descricao_peca);

        if (pecaDto.item_estoque_id) {
          item = await manager.findOne(ItemEstoque, {
            where: { id: pecaDto.item_estoque_id, ativo: true, excluido_em: IsNull() },
            lock: { mode: 'pessimistic_write' },
          });
          if (!item) throw new NotFoundException('Item de estoque nao encontrado');

          descricaoPeca = descricaoPeca ?? item.descricao;
          const saldoAnterior = Number(item.saldo_atual);
          const saldoPosterior = saldoAnterior - Number(pecaDto.quantidade);
          if (saldoPosterior < 0) {
            throw new BadRequestException(`Saldo insuficiente para ${item.descricao}`);
          }

          movimentacao = await manager.save(
            manager.create(MovimentacaoEstoque, {
              item_estoque: item,
              tipo: TipoMovimentacaoEstoque.SAIDA,
              origem: OrigemMovimentacaoEstoque.UTILIZACAO_OFICINA,
              quantidade: pecaDto.quantidade,
              saldo_anterior: saldoAnterior,
              saldo_posterior: saldoPosterior,
              veiculo,
              usuario: { id: usuario?.id } as Usuario,
              observacoes: `Manutencao ${manutencaoSalva.id}`,
            }),
          );

          item.saldo_atual = saldoPosterior;
          await manager.save(item);
        }

        if (!descricaoPeca) {
          throw new BadRequestException(
            'Descricao da peca e obrigatoria quando nao ha item de estoque',
          );
        }

        await manager.save(
          manager.create(ManutencaoPeca, {
            manutencao: manutencaoSalva,
            item_estoque: item,
            movimentacao_estoque: movimentacao,
            descricao_peca: descricaoPeca,
            quantidade: pecaDto.quantidade,
            preco_unitario: pecaDto.preco_unitario,
            valor_total: Number(pecaDto.quantidade) * Number(pecaDto.preco_unitario),
          }),
        );
      }

      return manutencaoSalva;
    });

    const completa = await this.buscarEntidadePorId(manutencao.id);
    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, completa, null, completa, usuario);
    return this.paraResposta(completa);
  }

  async listar(
    filtros: FiltrarManutencoesVeiculoDto = {},
    somenteProximasTrocas = false,
  ): Promise<RespostaPaginada<RespostaManutencaoVeiculoDto>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.manutencoesRepository
      .createQueryBuilder('manutencao')
      .leftJoinAndSelect('manutencao.veiculo', 'veiculo')
      .leftJoinAndSelect('manutencao.usuario', 'usuario')
      .leftJoinAndSelect('manutencao.pecas', 'peca')
      .leftJoinAndSelect('peca.item_estoque', 'item')
      .leftJoinAndSelect('peca.movimentacao_estoque', 'movimentacao')
      .where('manutencao.excluido_em IS NULL');

    if (somenteProximasTrocas) {
      query
        .andWhere('manutencao.troca_oleo = true')
        .andWhere('veiculo.ativo = true AND veiculo.excluido_em IS NULL').andWhere(`NOT EXISTS (
          SELECT 1 FROM manutencoes_veiculo recente
          WHERE recente.veiculo_id = manutencao.veiculo_id
            AND recente.troca_oleo = true AND recente.excluido_em IS NULL
            AND (recente.data_manutencao, recente.criado_em, recente.id)
              > (manutencao.data_manutencao, manutencao.criado_em, manutencao.id)
        )`);
    }

    if (filtros.veiculo_id) query.andWhere('veiculo.id = :veiculo_id', filtros);
    if (filtros.placa) {
      query.andWhere('(veiculo.placa ILIKE :placa OR manutencao.placa_snapshot ILIKE :placa)', {
        placa: `%${this.normalizarPlaca(filtros.placa)}%`,
      });
    }
    if (filtros.data_inicio) {
      query.andWhere('manutencao.data_manutencao >= :data_inicio', filtros);
    }
    if (filtros.data_fim) query.andWhere('manutencao.data_manutencao <= :data_fim', filtros);

    const [manutencoes, total] = await query
      .orderBy(
        somenteProximasTrocas ? 'manutencao.proxima_troca_oleo' : 'manutencao.data_manutencao',
        somenteProximasTrocas ? 'ASC' : 'DESC',
      )
      .addOrderBy('manutencao.criado_em', 'DESC')
      .addOrderBy('manutencao.id', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return {
      dados: manutencoes.map((manutencao) => this.paraResposta(manutencao)),
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string): Promise<RespostaManutencaoVeiculoDto> {
    return this.paraResposta(await this.buscarEntidadePorId(id));
  }

  async listarPorVeiculo(
    veiculoId: string,
    filtros: FiltrarManutencoesVeiculoDto = {},
  ): Promise<RespostaPaginada<RespostaManutencaoVeiculoDto>> {
    return this.listar({ ...filtros, veiculo_id: veiculoId });
  }

  async listarPorPlaca(
    placa: string,
    filtros: FiltrarManutencoesVeiculoDto = {},
  ): Promise<RespostaPaginada<RespostaManutencaoVeiculoDto>> {
    return this.listar({ ...filtros, placa });
  }

  async atualizar(
    id: string,
    dto: AtualizarManutencaoVeiculoDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaManutencaoVeiculoDto> {
    const { salva, dadosAnteriores } = await this.dataSource.transaction(async (manager) => {
      const manutencao = await manager.findOne(ManutencaoVeiculo, {
        where: { id, excluido_em: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!manutencao) throw new NotFoundException('Manutencao nao encontrada');
      const completa = await manager.findOne(ManutencaoVeiculo, {
        where: { id },
        withDeleted: true,
        relations: {
          veiculo: true,
          usuario: true,
          pecas: { item_estoque: true, movimentacao_estoque: true },
        },
      });
      Object.assign(manutencao, completa);
      const dadosAnteriores = this.paraObjetoAuditoria(manutencao);

      const trocaOleo = dto.troca_oleo ?? manutencao.troca_oleo ?? false;
      manutencao.proxima_troca_oleo = this.validarTrocaOleo(
        trocaOleo,
        dto.proxima_troca_oleo !== undefined
          ? dto.proxima_troca_oleo
          : manutencao.proxima_troca_oleo,
        dto.data_manutencao ?? manutencao.data_manutencao,
      );
      manutencao.troca_oleo = trocaOleo;
      manutencao.proxima_troca_oleo_km = this.validarProximaKm(
        trocaOleo,
        dto.proxima_troca_oleo_km !== undefined
          ? dto.proxima_troca_oleo_km
          : manutencao.proxima_troca_oleo_km,
        dto.quilometragem !== undefined ? dto.quilometragem : manutencao.quilometragem,
      );

      if (dto.veiculo_id !== undefined) {
        const veiculo = await manager.findOne(Veiculo, {
          where: { id: dto.veiculo_id, ativo: true, excluido_em: IsNull() },
        });
        if (!veiculo) throw new NotFoundException('Veiculo nao encontrado');
        manutencao.veiculo = veiculo;
        manutencao.placa_snapshot = veiculo.placa;
      }
      if (dto.data_manutencao !== undefined) manutencao.data_manutencao = dto.data_manutencao;
      if (dto.descricao !== undefined) manutencao.descricao = dto.descricao;
      if (dto.quilometragem !== undefined) manutencao.quilometragem = dto.quilometragem;
      if (dto.custo_mao_obra !== undefined) manutencao.custo_mao_obra = dto.custo_mao_obra;
      if (dto.observacoes !== undefined)
        manutencao.observacoes = this.normalizarTextoNullable(dto.observacoes);

      if (dto.pecas !== undefined) {
        manutencao.pecas = await this.atualizarPecas(manager, manutencao, dto.pecas, usuario);
      }
      const custoPecas = (manutencao.pecas ?? []).reduce(
        (total, peca) => total + Number(peca.valor_total),
        0,
      );
      manutencao.custo_total = Number(manutencao.custo_mao_obra) + custoPecas;

      const salva = await manager.save(manutencao);
      return { salva, dadosAnteriores };
    });
    const completa = await this.buscarEntidadePorId(salva.id);
    await this.registrarAuditoria(
      AcaoAuditoria.EDICAO,
      completa,
      dadosAnteriores,
      completa,
      usuario,
    );
    return this.paraResposta(completa);
  }

  private async atualizarPecas(
    manager: EntityManager,
    manutencao: ManutencaoVeiculo,
    pecas: PecaManutencaoDto[],
    usuario?: UsuarioAuditoria,
  ): Promise<ManutencaoPeca[]> {
    const anteriores = new Map<string, number>();
    const novas = new Map<string, number>();
    const movimentos = new Map<string, MovimentacaoEstoque>();
    for (const peca of manutencao.pecas ?? []) {
      if (!peca.item_estoque) continue;
      const id = peca.item_estoque.id;
      anteriores.set(id, (anteriores.get(id) ?? 0) + Number(peca.quantidade));
      if (peca.movimentacao_estoque) movimentos.set(id, peca.movimentacao_estoque);
    }
    for (const peca of pecas) {
      if (peca.item_estoque_id) {
        novas.set(
          peca.item_estoque_id,
          (novas.get(peca.item_estoque_id) ?? 0) + Number(peca.quantidade),
        );
      } else if (!peca.descricao_peca?.trim()) {
        throw new BadRequestException(
          'Descricao da peca e obrigatoria quando nao ha item de estoque',
        );
      }
    }

    const itens = new Map<string, ItemEstoque>();
    // Ordem estável de bloqueio evita que edições concorrentes invertam os locks do estoque.
    const ids = [...new Set([...anteriores.keys(), ...novas.keys()])].sort();
    for (const id of ids) {
      const item = await manager.findOne(ItemEstoque, {
        where: { id },
        withDeleted: true,
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) throw new NotFoundException('Item de estoque nao encontrado');
      itens.set(id, item);
      const diferenca = Number(((novas.get(id) ?? 0) - (anteriores.get(id) ?? 0)).toFixed(3));
      if (diferenca > 0 && (!item.ativo || item.excluido_em)) {
        throw new BadRequestException(`Item indisponível para utilização: ${item.descricao}`);
      }
      if (diferenca === 0) continue;
      const saldoAnterior = Number(item.saldo_atual);
      const saldoPosterior = Number((saldoAnterior - diferenca).toFixed(3));
      if (saldoPosterior < 0)
        throw new BadRequestException(`Saldo insuficiente para ${item.descricao}`);
      const movimento = await manager.save(
        manager.create(MovimentacaoEstoque, {
          item_estoque: item,
          tipo: diferenca > 0 ? TipoMovimentacaoEstoque.SAIDA : TipoMovimentacaoEstoque.ENTRADA,
          origem: OrigemMovimentacaoEstoque.UTILIZACAO_OFICINA,
          quantidade: Math.abs(diferenca),
          saldo_anterior: saldoAnterior,
          saldo_posterior: saldoPosterior,
          veiculo: manutencao.veiculo,
          usuario: { id: usuario?.id } as Usuario,
          observacoes: `Edição da manutenção ${manutencao.id}: ${diferenca > 0 ? 'consumo adicional' : 'devolução de peças'}`,
        }),
      );
      movimentos.set(id, movimento);
      item.saldo_atual = saldoPosterior;
      await manager.save(item);
    }

    await manager.delete(ManutencaoPeca, { manutencao: { id: manutencao.id } });
    const resultado: ManutencaoPeca[] = [];
    for (const peca of pecas) {
      const item = peca.item_estoque_id ? itens.get(peca.item_estoque_id)! : null;
      resultado.push(
        await manager.save(
          manager.create(ManutencaoPeca, {
            manutencao,
            item_estoque: item,
            movimentacao_estoque: item ? (movimentos.get(item.id) ?? null) : null,
            descricao_peca: peca.descricao_peca?.trim() || item!.descricao,
            quantidade: peca.quantidade,
            preco_unitario: peca.preco_unitario,
            valor_total: Number(peca.quantidade) * Number(peca.preco_unitario),
          }),
        ),
      );
    }
    return resultado;
  }

  async remover(id: string, usuario?: UsuarioAuditoria): Promise<void> {
    const manutencao = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(manutencao);
    manutencao.excluido_em = new Date();
    await this.manutencoesRepository.save(manutencao);
    await this.registrarAuditoria(
      AcaoAuditoria.EXCLUSAO,
      manutencao,
      dadosAnteriores,
      null,
      usuario,
    );
  }

  private async buscarEntidadePorId(id: string): Promise<ManutencaoVeiculo> {
    const manutencao = await this.manutencoesRepository.findOne({
      where: { id, excluido_em: IsNull() },
      relations: {
        veiculo: true,
        usuario: true,
        pecas: { item_estoque: true, movimentacao_estoque: true },
      },
      order: { pecas: { criado_em: 'ASC' } },
    });

    if (!manutencao) throw new NotFoundException('Manutencao nao encontrada');
    return manutencao;
  }

  private normalizarTextoNullable(valor?: string | null) {
    const texto = valor?.trim();
    return texto ? texto : null;
  }

  private validarProximaKm(
    trocaOleo: boolean,
    proxima: number | null | undefined,
    atual: number | null | undefined,
  ): number | null {
    if (!trocaOleo || proxima == null) return null;
    if (
      !Number.isInteger(proxima) ||
      proxima < 1 ||
      proxima > 99_999_999 ||
      (atual != null && proxima <= atual)
    ) {
      throw new BadRequestException(
        'A próxima quilometragem deve ser um inteiro positivo de até 8 dígitos e maior que a quilometragem da manutenção.',
      );
    }
    return proxima;
  }

  private validarTrocaOleo(
    trocaOleo: boolean,
    proxima: string | null | undefined,
    data: string,
  ): string | null {
    if (!trocaOleo) return null;
    if (
      !proxima ||
      !/^\d{4}-\d{2}-\d{2}$/.test(proxima) ||
      !Number.isFinite(Date.parse(proxima)) ||
      new Date(proxima).toISOString().slice(0, 10) !== proxima ||
      proxima <= data.slice(0, 10)
    ) {
      throw new BadRequestException(
        'Informe uma data de próxima troca de óleo posterior à data da manutenção.',
      );
    }
    return proxima;
  }

  private normalizarPlaca(placa: string) {
    return placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    manutencao: ManutencaoVeiculo,
    dados_anteriores: Record<string, unknown> | null,
    dados_novos: ManutencaoVeiculo | null,
    usuario?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuario?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'manutencao_veiculo',
      entidade_id: manutencao.id,
      acao,
      dados_anteriores,
      dados_novos: dados_novos ? this.paraObjetoAuditoria(dados_novos) : null,
      usuario_id: usuario.id,
      usuario_nome: usuario.nome ?? usuario.email ?? usuario.id,
    });
  }

  private paraObjetoAuditoria(manutencao: ManutencaoVeiculo): Record<string, unknown> {
    return { ...this.paraResposta(manutencao), excluido_em: manutencao.excluido_em };
  }

  private paraResposta(manutencao: ManutencaoVeiculo): RespostaManutencaoVeiculoDto {
    return {
      id: manutencao.id,
      veiculo_id: manutencao.veiculo.id,
      placa: manutencao.placa_snapshot,
      data_manutencao: manutencao.data_manutencao,
      troca_oleo: manutencao.troca_oleo ?? false,
      proxima_troca_oleo: manutencao.proxima_troca_oleo ?? null,
      proxima_troca_oleo_km: manutencao.proxima_troca_oleo_km ?? null,
      descricao: manutencao.descricao,
      quilometragem: manutencao.quilometragem,
      custo_mao_obra: Number(manutencao.custo_mao_obra),
      custo_total: Number(manutencao.custo_total),
      observacoes: manutencao.observacoes,
      usuario_id: manutencao.usuario.id,
      usuario_nome: manutencao.usuario.nome,
      pecas: (manutencao.pecas ?? []).map((peca) => this.paraRespostaPeca(peca)),
      criado_em: manutencao.criado_em,
      atualizado_em: manutencao.atualizado_em,
    };
  }

  private paraRespostaPeca(peca: ManutencaoPeca): RespostaManutencaoPecaDto {
    return {
      id: peca.id,
      item_estoque_id: peca.item_estoque?.id ?? null,
      movimentacao_estoque_id: peca.movimentacao_estoque?.id ?? null,
      descricao_peca: peca.descricao_peca,
      quantidade: Number(peca.quantidade),
      preco_unitario: Number(peca.preco_unitario),
      valor_total: Number(peca.valor_total),
      criado_em: peca.criado_em,
    };
  }
}
