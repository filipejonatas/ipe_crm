import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracao } from './configuracao.entity';
import { AtualizarConfiguracaoDto } from './dto/atualizar-configuracao.dto';
import { RespostaConfiguracaoDto } from './dto/resposta-configuracao.dto';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Configuracao)
    private readonly configuracoesRepository: Repository<Configuracao>,
  ) {}

  async listar(): Promise<RespostaConfiguracaoDto[]> {
    const configuracoes = await this.configuracoesRepository.find({ order: { chave: 'ASC' } });
    return configuracoes.map((configuracao) => this.paraResposta(configuracao));
  }

  async buscarPorChave(chave: string): Promise<RespostaConfiguracaoDto> {
    return this.paraResposta(await this.buscarEntidadePorChave(chave));
  }

  async atualizar(chave: string, dto: AtualizarConfiguracaoDto): Promise<RespostaConfiguracaoDto> {
    const configuracao = await this.buscarEntidadePorChave(chave);
    configuracao.valor = dto.valor;
    if (dto.descricao !== undefined) configuracao.descricao = dto.descricao;
    return this.paraResposta(await this.configuracoesRepository.save(configuracao));
  }

  private async buscarEntidadePorChave(chave: string): Promise<Configuracao> {
    const configuracao = await this.configuracoesRepository.findOne({ where: { chave } });

    if (!configuracao) {
      throw new NotFoundException('Configuracao nao encontrada');
    }

    return configuracao;
  }

  private paraResposta(configuracao: Configuracao): RespostaConfiguracaoDto {
    return {
      id: configuracao.id,
      chave: configuracao.chave,
      valor: configuracao.valor,
      descricao: configuracao.descricao,
      criado_em: configuracao.criado_em,
      atualizado_em: configuracao.atualizado_em,
    };
  }
}
