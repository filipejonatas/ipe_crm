import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PERFIS } from '@ipe_crm/shared';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GuardPerfis } from '../src/common';
import { EstrategiaJwt } from '../src/modules/autenticacao/estrategia-jwt';
import { CategoriaItemEstoque } from '../src/modules/estoque/entities/categoria-item-estoque.enum';
import { ItemEstoque } from '../src/modules/estoque/entities/item-estoque.entity';
import { ItensEstoqueController } from '../src/modules/estoque/itens-estoque.controller';
import { ItensEstoqueService } from '../src/modules/estoque/itens-estoque.service';
import { MovimentacoesEstoqueController } from '../src/modules/estoque/movimentacoes-estoque.controller';
import { MovimentacoesEstoqueService } from '../src/modules/estoque/movimentacoes-estoque.service';

interface RespostaItemEstoque {
  codigo: string | null;
  marca: string | null;
  unidade_medida: string;
  saldo_inicial: number;
  estoque_minimo: number;
}

interface RespostaMovimentacao {
  item_estoque_id: string;
  veiculo_id: string;
  quantidade: number;
  novo_saldo: number;
}

interface RegistroMovimentacao {
  id: string;
  tipo: string;
  item_estoque?: ItemEstoque;
  quantidade?: number;
  veiculo?: { id: string; placa: string };
  usuario?: { id: string; nome: string };
  saldo_anterior?: number;
  saldo_posterior?: number;
  item_estoque_id?: string;
  novo_saldo?: number;
  motivo?: string;
}

describe('EstoqueController (e2e)', () => {
  let app: INestApplication;
  let servidor: App;
  let jwtService: JwtService;
  const itemId = '11111111-1111-4111-8111-111111111111';
  const veiculoId = '22222222-2222-4222-8222-222222222222';
  const itens: ItemEstoque[] = [];
  const movimentacoes: RegistroMovimentacao[] = [];

  beforeEach(async () => {
    itens.length = 0;
    movimentacoes.length = 0;

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: 'segredo-teste' })],
      controllers: [ItensEstoqueController, MovimentacoesEstoqueController],
      providers: [
        GuardPerfis,
        EstrategiaJwt,
        { provide: ConfigService, useValue: { get: jest.fn(() => 'segredo-teste') } },
        {
          provide: ItensEstoqueService,
          useValue: {
            criar: jest.fn((dto: RespostaItemEstoque) => {
              const item = {
                id: itemId,
                ...dto,
                codigo: dto.codigo ?? null,
                marca: dto.marca ?? null,
                unidade_medida: dto.unidade_medida ?? 'un',
                saldo_atual: dto.saldo_inicial ?? 0,
                estoque_minimo: dto.estoque_minimo ?? 0,
                ativo: true,
                observacoes: null,
                criado_em: new Date(),
                atualizado_em: new Date(),
                excluido_em: null,
              } as ItemEstoque;
              itens.push(item);
              return Promise.resolve(item);
            }),
            listar: jest.fn(() =>
              Promise.resolve({ dados: itens, total: itens.length, pagina: 1, limite: 10 }),
            ),
            buscarPorId: jest.fn(),
            atualizar: jest.fn((id: string, dto: Partial<ItemEstoque>) => {
              const item = itens.find((registro) => registro.id === id) ?? itens[0];
              Object.assign(item, dto);
              return Promise.resolve(item);
            }),
            remover: jest.fn(),
            vincularVeiculos: jest.fn(),
            listarVeiculosCompativeis: jest.fn(() => Promise.resolve([])),
          },
        },
        {
          provide: MovimentacoesEstoqueService,
          useValue: {
            registrarSaida: jest.fn((dto: RespostaMovimentacao) => {
              const item =
                itens.find((registro) => registro.id === dto.item_estoque_id) ?? itens[0];
              if (item.categoria === CategoriaItemEstoque.FILTRO && !dto.veiculo_id) {
                throw new BadRequestException('Saida de filtro exige veiculo informado');
              }
              if (item.saldo_atual < dto.quantidade)
                throw new BadRequestException('Saldo insuficiente');
              const saldoAnterior = Number(item.saldo_atual);
              item.saldo_atual = Number(item.saldo_atual) - Number(dto.quantidade);
              const mov: RegistroMovimentacao = {
                id: 'mov-1',
                tipo: 'saida',
                item_estoque: item,
                quantidade: dto.quantidade,
                veiculo: { id: dto.veiculo_id, placa: 'ABC1234' },
                usuario: { id: 'usuario-token', nome: 'Usuario Teste' },
                saldo_anterior: saldoAnterior,
                saldo_posterior: item.saldo_atual,
              };
              movimentacoes.push(mov);
              return Promise.resolve(mov);
            }),
            registrarAjuste: jest.fn((dto: RespostaMovimentacao) => {
              const item =
                itens.find((registro) => registro.id === dto.item_estoque_id) ?? itens[0];
              item.saldo_atual = dto.novo_saldo;
              const mov: RegistroMovimentacao = { id: 'mov-2', tipo: 'ajuste', ...dto };
              movimentacoes.push(mov);
              return Promise.resolve(mov);
            }),
            listar: jest.fn(() =>
              Promise.resolve({
                dados: movimentacoes,
                total: movimentacoes.length,
                pagina: 1,
                limite: 10,
              }),
            ),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    servidor = app.getHttpServer() as App;
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  function token(perfil: string) {
    return jwtService.sign({
      sub: 'usuario-token',
      nome: 'Usuario Teste',
      email: 'teste@ipecrm.com',
      perfil,
    });
  }

  function criarItemEmMemoria(saldo = 5) {
    itens.push({
      id: itemId,
      codigo: 'FIL-001',
      descricao: 'Filtro',
      categoria: CategoriaItemEstoque.FILTRO,
      unidade_medida: 'un',
      saldo_atual: saldo,
      estoque_minimo: 1,
      ativo: true,
      criado_em: new Date(),
      atualizado_em: new Date(),
      excluido_em: null,
    } as ItemEstoque);
  }

  it('POST /api/v1/itens-estoque com admin cria item', () =>
    request(servidor)
      .post('/api/v1/itens-estoque')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .send({ descricao: 'Filtro', categoria: CategoriaItemEstoque.FILTRO })
      .expect(201));

  it('POST /api/v1/itens-estoque sem token retorna 401', () =>
    request(servidor)
      .post('/api/v1/itens-estoque')
      .send({ descricao: 'Filtro', categoria: CategoriaItemEstoque.FILTRO })
      .expect(401));

  it('GET /api/v1/itens-estoque com oficina retorna lista', () =>
    request(servidor)
      .get('/api/v1/itens-estoque')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .expect(200));

  it('PATCH /api/v1/itens-estoque/:id com compras atualiza cadastro', async () => {
    criarItemEmMemoria();
    const resposta = await request(servidor)
      .patch(`/api/v1/itens-estoque/${itemId}`)
      .set('Authorization', `Bearer ${token(PERFIS.COMPRAS)}`)
      .send({ descricao: 'Filtro atualizado' })
      .expect(200);
    const body = resposta.body as RespostaItemEstoque;
    void body;
    expect(itens[0].descricao).toBe('Filtro atualizado');
  });

  it('DELETE /api/v1/itens-estoque/:id com oficina retorna 403', () =>
    request(servidor)
      .delete(`/api/v1/itens-estoque/${itemId}`)
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .expect(403));

  it('POST /api/v1/movimentacoes-estoque/saida com oficina reduz saldo', async () => {
    criarItemEmMemoria(5);
    await request(servidor)
      .post('/api/v1/movimentacoes-estoque/saida')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ item_estoque_id: itemId, quantidade: 2, veiculo_id: veiculoId })
      .expect(201);
    expect(itens[0].saldo_atual).toBe(3);
  });

  it('POST /api/v1/movimentacoes-estoque/saida com filtro sem veiculo retorna 400', () => {
    criarItemEmMemoria(5);
    return request(servidor)
      .post('/api/v1/movimentacoes-estoque/saida')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ item_estoque_id: itemId, quantidade: 2 })
      .expect(400);
  });

  it('POST /api/v1/movimentacoes-estoque/saida com saldo insuficiente retorna 400', () => {
    criarItemEmMemoria(1);
    return request(servidor)
      .post('/api/v1/movimentacoes-estoque/saida')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ item_estoque_id: itemId, quantidade: 2, veiculo_id: veiculoId })
      .expect(400);
  });

  it('POST /api/v1/movimentacoes-estoque/ajuste com oficina retorna 403', () =>
    request(servidor)
      .post('/api/v1/movimentacoes-estoque/ajuste')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ item_estoque_id: itemId, novo_saldo: 3, motivo: 'Correcao' })
      .expect(403));

  it('POST /api/v1/movimentacoes-estoque/ajuste com gerente altera saldo', async () => {
    criarItemEmMemoria(1);
    await request(servidor)
      .post('/api/v1/movimentacoes-estoque/ajuste')
      .set('Authorization', `Bearer ${token(PERFIS.GERENTE)}`)
      .send({ item_estoque_id: itemId, novo_saldo: 3, motivo: 'Correcao' })
      .expect(201);
    expect(itens[0].saldo_atual).toBe(3);
  });

  it('GET /api/v1/movimentacoes-estoque com gerente retorna historico', () =>
    request(servidor)
      .get('/api/v1/movimentacoes-estoque')
      .set('Authorization', `Bearer ${token(PERFIS.GERENTE)}`)
      .expect(200));

  it('movimentacao de filtro registra item, quantidade, veiculo, usuario e saldos', async () => {
    criarItemEmMemoria(5);
    await request(servidor)
      .post('/api/v1/movimentacoes-estoque/saida')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ item_estoque_id: itemId, quantidade: 2, veiculo_id: veiculoId })
      .expect(201);

    const mov = movimentacoes[0];
    const quantidade = mov.quantidade;
    const veiculo_id = mov.veiculo?.id;

    const itemEstoqueEsperado: unknown = expect.objectContaining({ id: itemId });
    const veiculoEsperado: unknown = expect.objectContaining({ id: veiculo_id });
    const usuarioEsperado: unknown = expect.objectContaining({ id: 'usuario-token' });

    expect(movimentacoes[0]).toEqual(
      expect.objectContaining({
        item_estoque: itemEstoqueEsperado,
        quantidade,
        veiculo: veiculoEsperado,
        usuario: usuarioEsperado,
        saldo_anterior: 5,
        saldo_posterior: 3,
      }),
    );
  });
});
