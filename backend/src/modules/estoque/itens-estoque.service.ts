import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { Brackets, In, IsNull, Not, Repository } from 'typeorm';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { Veiculo } from '../veiculos/veiculo.entity';
import { AtualizarItemEstoqueDto } from './dto/atualizar-item-estoque.dto';
import { CriarItemEstoqueDto } from './dto/criar-item-estoque.dto';
import { FiltrarItensEstoqueDto } from './dto/filtrar-itens-estoque.dto';
import { RespostaItemEstoqueDto } from './dto/resposta-item-estoque.dto';
import { VincularVeiculosItemDto } from './dto/vincular-veiculos-item.dto';
import { ItemEstoque } from './entities/item-estoque.entity';
import { ItemEstoqueVeiculo } from './entities/item-estoque-veiculo.entity';
import { OrigemMovimentacaoEstoque } from './entities/origem-movimentacao-estoque.enum';
import { MovimentacoesEstoqueService } from './movimentacoes-estoque.service';

@Injectable()
export class ItensEstoqueService {
  constructor(
    @InjectRepository(ItemEstoque)
    private readonly itensRepository: Repository<ItemEstoque>,
    @InjectRepository(ItemEstoqueVeiculo)
    private readonly compatibilidadesRepository: Repository<ItemEstoqueVeiculo>,
    @InjectRepository(Veiculo)
    private readonly veiculosRepository: Repository<Veiculo>,
    private readonly movimentacoesEstoqueService: MovimentacoesEstoqueService,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async criar(
    dto: CriarItemEstoqueDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaItemEstoqueDto> {
    const codigo = this.normalizarTextoNullable(dto.codigo);
    if (codigo) await this.validarCodigoDuplicado(codigo);

    const item = this.itensRepository.create({
      codigo,
      descricao: dto.descricao,
      marca: this.normalizarTextoNullable(dto.marca),
      categoria: dto.categoria,
      unidade_medida: dto.unidade_medida || 'un',
      saldo_atual: 0,
      estoque_minimo: dto.estoque_minimo ?? 0,
      observacoes: this.normalizarTextoNullable(dto.observacoes),
    });
    const salvo = await this.itensRepository.save(item);

    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, salvo, null, salvo, usuario);

    if ((dto.saldo_inicial ?? 0) > 0) {
      await this.movimentacoesEstoqueService.registrarEntrada({
        item_estoque_id: salvo.id,
        quantidade: dto.saldo_inicial!,
        origem: OrigemMovimentacaoEstoque.SALDO_INICIAL,
        usuarioAtual: usuario,
        observacoes: 'Saldo inicial',
      });
    }

    return this.buscarPorId(salvo.id);
  }

  async listar(
    filtros: FiltrarItensEstoqueDto = {},
  ): Promise<RespostaPaginada<RespostaItemEstoqueDto>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.itensRepository.createQueryBuilder('item').where('item.excluido_em IS NULL');

    if (filtros.busca) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('item.codigo ILIKE :busca', { busca: `%${filtros.busca}%` })
            .orWhere('item.descricao ILIKE :busca', { busca: `%${filtros.busca}%` })
            .orWhere('item.marca ILIKE :busca', { busca: `%${filtros.busca}%` });
        }),
      );
    }

    if (filtros.categoria) query.andWhere('item.categoria = :categoria', filtros);
    if (filtros.ativo !== undefined) query.andWhere('item.ativo = :ativo', filtros);
    if (filtros.baixo_estoque) query.andWhere('item.saldo_atual <= item.estoque_minimo');

    const [itens, total] = await query
      .orderBy('item.descricao', 'ASC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return {
      dados: itens.map((item) => this.paraResposta(item)),
      total,
      pagina,
      limite,
      total_paginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string): Promise<RespostaItemEstoqueDto> {
    return this.paraResposta(await this.buscarEntidadePorId(id));
  }

  async atualizar(
    id: string,
    dto: AtualizarItemEstoqueDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaItemEstoqueDto> {
    const item = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(item);

    if (dto.codigo !== undefined) {
      const codigo = this.normalizarTextoNullable(dto.codigo);
      if (codigo && codigo !== item.codigo) await this.validarCodigoDuplicado(codigo, id);
      item.codigo = codigo;
    }
    if (dto.descricao !== undefined) item.descricao = dto.descricao;
    if (dto.marca !== undefined) item.marca = this.normalizarTextoNullable(dto.marca);
    if (dto.categoria !== undefined) item.categoria = dto.categoria;
    if (dto.unidade_medida !== undefined) item.unidade_medida = dto.unidade_medida;
    if (dto.estoque_minimo !== undefined) item.estoque_minimo = dto.estoque_minimo;
    if (dto.ativo !== undefined) item.ativo = dto.ativo;
    if (dto.observacoes !== undefined)
      item.observacoes = this.normalizarTextoNullable(dto.observacoes);

    const salvo = await this.itensRepository.save(item);
    await this.registrarAuditoria(AcaoAuditoria.EDICAO, salvo, dadosAnteriores, salvo, usuario);
    return this.paraResposta(salvo);
  }

  async remover(id: string, usuario?: UsuarioAuditoria): Promise<void> {
    const item = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(item);
    item.excluido_em = new Date();
    await this.itensRepository.save(item);
    await this.registrarAuditoria(AcaoAuditoria.EXCLUSAO, item, dadosAnteriores, null, usuario);
  }

  async vincularVeiculos(itemId: string, dto: VincularVeiculosItemDto, usuario?: UsuarioAuditoria) {
    const item = await this.buscarEntidadePorId(itemId);
    const idsUnicos = [...new Set(dto.veiculos_ids)];
    const veiculos = await this.veiculosRepository.find({
      where: { id: In(idsUnicos), ativo: true, excluido_em: IsNull() },
    });

    if (veiculos.length !== idsUnicos.length) {
      throw new BadRequestException('Um ou mais veiculos informados nao existem ou estao inativos');
    }

    const anteriores = await this.listarVeiculosCompativeis(itemId);
    await this.compatibilidadesRepository
      .createQueryBuilder()
      .delete()
      .where('item_estoque_id = :itemId', { itemId })
      .execute();
    await this.compatibilidadesRepository.save(
      veiculos.map((veiculo) =>
        this.compatibilidadesRepository.create({ item_estoque: item, veiculo }),
      ),
    );

    await this.registrarAuditoria(
      AcaoAuditoria.EDICAO,
      item,
      { veiculos_ids: anteriores.map((veiculo) => veiculo.id) },
      { ...item, veiculos_ids: idsUnicos } as ItemEstoque,
      usuario,
    );

    return { ...this.paraResposta(item), veiculos };
  }

  async listarVeiculosCompativeis(itemId: string) {
    await this.buscarEntidadePorId(itemId);
    const vinculos = await this.compatibilidadesRepository.find({
      where: { item_estoque: { id: itemId } },
      relations: { veiculo: true },
      order: { criado_em: 'ASC' },
    });
    return vinculos.map((vinculo) => vinculo.veiculo);
  }

  private async buscarEntidadePorId(id: string): Promise<ItemEstoque> {
    const item = await this.itensRepository.findOne({ where: { id, excluido_em: IsNull() } });
    if (!item) throw new NotFoundException('Item de estoque nao encontrado');
    return item;
  }

  private async validarCodigoDuplicado(codigo: string, idAtual?: string) {
    const where = idAtual
      ? { codigo, id: Not(idAtual), excluido_em: IsNull() }
      : { codigo, excluido_em: IsNull() };
    const existente = await this.itensRepository.findOne({ where });
    if (existente) throw new ConflictException('Codigo ja cadastrado');
  }

  private normalizarTextoNullable(valor?: string | null) {
    const texto = valor?.trim();
    return texto ? texto : null;
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    item: ItemEstoque,
    dados_anteriores: Record<string, unknown> | null,
    dados_novos: ItemEstoque | null,
    usuario?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuario?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'item_estoque',
      entidade_id: item.id,
      acao,
      dados_anteriores,
      dados_novos: dados_novos ? this.paraObjetoAuditoria(dados_novos) : null,
      usuario_id: usuario.id,
      usuario_nome: usuario.nome ?? usuario.email ?? usuario.id,
    });
  }

  private paraObjetoAuditoria(item: ItemEstoque): Record<string, unknown> {
    return { ...this.paraResposta(item), excluido_em: item.excluido_em };
  }

  private paraResposta(item: ItemEstoque): RespostaItemEstoqueDto {
    return {
      id: item.id,
      codigo: item.codigo,
      descricao: item.descricao,
      marca: item.marca,
      categoria: item.categoria,
      unidade_medida: item.unidade_medida,
      saldo_atual: Number(item.saldo_atual),
      estoque_minimo: Number(item.estoque_minimo),
      ativo: item.ativo,
      observacoes: item.observacoes,
      criado_em: item.criado_em,
      atualizado_em: item.atualizado_em,
    };
  }
}
