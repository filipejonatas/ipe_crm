import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RespostaPaginada } from '@ipe_crm/shared';
import { Brackets, IsNull, Not, Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import type { UsuarioAuditoria } from '../fornecedores/fornecedores.service';
import { AtualizarVeiculoDto } from './dto/atualizar-veiculo.dto';
import { CriarVeiculoDto } from './dto/criar-veiculo.dto';
import { FiltrarVeiculoDto } from './dto/filtrar-veiculo.dto';
import { RespostaVeiculoDto } from './dto/resposta-veiculo.dto';
import { Veiculo } from './veiculo.entity';

@Injectable()
export class VeiculosService {
  constructor(
    @InjectRepository(Veiculo)
    private readonly veiculosRepository: Repository<Veiculo>,
    private readonly auditoriaService?: AuditoriaService,
  ) {}

  async criar(dto: CriarVeiculoDto, usuario?: UsuarioAuditoria): Promise<RespostaVeiculoDto> {
    const placa = this.normalizarPlaca(dto.placa);
    await this.validarPlacaDuplicada(placa);
    const veiculo = this.veiculosRepository.create({ ...dto, placa });
    const salvo = await this.veiculosRepository.save(veiculo);
    await this.registrarAuditoria(AcaoAuditoria.CRIACAO, salvo, null, salvo, usuario);
    return this.paraResposta(salvo);
  }

  async listar(filtros: FiltrarVeiculoDto = {}): Promise<RespostaPaginada<RespostaVeiculoDto>> {
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 100);
    const query = this.veiculosRepository
      .createQueryBuilder('veiculo')
      .where('veiculo.excluido_em IS NULL');

    if (filtros.busca) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('veiculo.placa ILIKE :busca', { busca: `%${filtros.busca}%` })
            .orWhere('veiculo.modelo ILIKE :busca', { busca: `%${filtros.busca}%` })
            .orWhere('veiculo.marca ILIKE :busca', { busca: `%${filtros.busca}%` });
        }),
      );
    }

    if (filtros.ativo !== undefined) {
      query.andWhere('veiculo.ativo = :ativo', { ativo: filtros.ativo });
    }

    const [veiculos, total] = await query
      .orderBy('veiculo.criado_em', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { dados: veiculos.map((item) => this.paraResposta(item)), total, pagina, limite };
  }

  async buscarPorId(id: string): Promise<RespostaVeiculoDto> {
    return this.paraResposta(await this.buscarEntidadePorId(id));
  }

  async atualizar(
    id: string,
    dto: AtualizarVeiculoDto,
    usuario?: UsuarioAuditoria,
  ): Promise<RespostaVeiculoDto> {
    const veiculo = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(veiculo);

    if (dto.placa !== undefined) {
      const placa = this.normalizarPlaca(dto.placa);
      await this.validarPlacaDuplicada(placa, id);
      veiculo.placa = placa;
    }
    if (dto.modelo !== undefined) veiculo.modelo = dto.modelo;
    if (dto.marca !== undefined) veiculo.marca = dto.marca;
    if (dto.ano !== undefined) veiculo.ano = dto.ano;
    if (dto.observacoes !== undefined) veiculo.observacoes = dto.observacoes;
    if (dto.ativo !== undefined) veiculo.ativo = dto.ativo;

    const salvo = await this.veiculosRepository.save(veiculo);
    await this.registrarAuditoria(AcaoAuditoria.EDICAO, salvo, dadosAnteriores, salvo, usuario);
    return this.paraResposta(salvo);
  }

  async remover(id: string, usuario?: UsuarioAuditoria): Promise<void> {
    const veiculo = await this.buscarEntidadePorId(id);
    const dadosAnteriores = this.paraObjetoAuditoria(veiculo);
    veiculo.excluido_em = new Date();
    await this.veiculosRepository.save(veiculo);
    await this.registrarAuditoria(AcaoAuditoria.EXCLUSAO, veiculo, dadosAnteriores, null, usuario);
  }

  private async buscarEntidadePorId(id: string): Promise<Veiculo> {
    const veiculo = await this.veiculosRepository.findOne({
      where: { id, excluido_em: IsNull() },
    });

    if (!veiculo) {
      throw new NotFoundException('Veiculo nao encontrado');
    }

    return veiculo;
  }

  private async validarPlacaDuplicada(placa: string, idAtual?: string) {
    const where = idAtual
      ? { placa, id: Not(idAtual), excluido_em: IsNull() }
      : { placa, excluido_em: IsNull() };
    const existente = await this.veiculosRepository.findOne({ where });

    if (existente) {
      throw new ConflictException('Placa ja cadastrada');
    }
  }

  private normalizarPlaca(placa: string) {
    return placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }

  private async registrarAuditoria(
    acao: AcaoAuditoria,
    veiculo: Veiculo,
    dados_anteriores: Record<string, unknown> | null,
    dados_novos: Veiculo | null,
    usuario?: UsuarioAuditoria,
  ) {
    if (!this.auditoriaService || !usuario?.id) return;

    await this.auditoriaService.registrar({
      entidade: 'veiculo',
      entidade_id: veiculo.id,
      acao,
      dados_anteriores,
      dados_novos: dados_novos ? this.paraObjetoAuditoria(dados_novos) : null,
      usuario_id: usuario.id,
      usuario_nome: usuario.nome ?? usuario.email ?? usuario.id,
    });
  }

  private paraObjetoAuditoria(veiculo: Veiculo): Record<string, unknown> {
    return { ...this.paraResposta(veiculo), excluido_em: veiculo.excluido_em };
  }

  private paraResposta(veiculo: Veiculo): RespostaVeiculoDto {
    return {
      id: veiculo.id,
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      marca: veiculo.marca,
      ano: veiculo.ano,
      observacoes: veiculo.observacoes,
      ativo: veiculo.ativo,
      criado_em: veiculo.criado_em,
      atualizado_em: veiculo.atualizado_em,
    };
  }
}
