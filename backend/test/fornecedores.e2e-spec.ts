import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PERFIS } from '@ipe_crm/shared';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GuardPerfis } from '../src/common';
import { EstrategiaJwt } from '../src/modules/autenticacao/estrategia-jwt';
import { Fornecedor } from '../src/modules/fornecedores/fornecedor.entity';
import { FornecedoresController } from '../src/modules/fornecedores/fornecedores.controller';
import { FornecedoresService } from '../src/modules/fornecedores/fornecedores.service';

describe('FornecedoresController (e2e)', () => {
  let app: INestApplication;
  let servidor: App;
  let jwtService: JwtService;
  const fornecedores: Fornecedor[] = [];

  beforeEach(async () => {
    fornecedores.length = 0;
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: 'segredo-teste' })],
      controllers: [FornecedoresController],
      providers: [
        GuardPerfis,
        EstrategiaJwt,
        { provide: ConfigService, useValue: { get: jest.fn(() => 'segredo-teste') } },
        {
          provide: FornecedoresService,
          useValue: {
            criar: jest.fn((dto: Partial<Fornecedor>) => {
              const fornecedor = {
                id: `fornecedor-${fornecedores.length + 1}`,
                razao_social: dto.razao_social,
                nome_fantasia: dto.nome_fantasia ?? null,
                cnpj: dto.cnpj ?? null,
                telefone: null,
                email: null,
                observacoes: null,
                ativo: true,
                criado_em: new Date(),
                atualizado_em: new Date(),
                excluido_em: null,
              } as Fornecedor;
              fornecedores.push(fornecedor);
              return Promise.resolve(fornecedor);
            }),
            listar: jest.fn(() =>
              Promise.resolve({
                dados: fornecedores.filter((fornecedor) => !fornecedor.excluido_em),
                total: fornecedores.filter((fornecedor) => !fornecedor.excluido_em).length,
                pagina: 1,
                limite: 10,
              }),
            ),
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
            remover: jest.fn((id: string) => {
              const fornecedor = fornecedores.find((item) => item.id === id);
              if (fornecedor) fornecedor.excluido_em = new Date();
              return Promise.resolve();
            }),
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

  it('POST /api/v1/fornecedores sem token retorna 401', () => {
    return request(servidor)
      .post('/api/v1/fornecedores')
      .send({ razao_social: 'Fornecedor' })
      .expect(401);
  });

  it('POST /api/v1/fornecedores com perfil oficina retorna 403', () => {
    return request(servidor)
      .post('/api/v1/fornecedores')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .send({ razao_social: 'Fornecedor' })
      .expect(403);
  });

  it('POST /api/v1/fornecedores com perfil compras retorna 201', () => {
    return request(servidor)
      .post('/api/v1/fornecedores')
      .set('Authorization', `Bearer ${token(PERFIS.COMPRAS)}`)
      .send({ razao_social: 'Fornecedor' })
      .expect(201);
  });

  it('GET /api/v1/fornecedores com perfil gerente retorna lista paginada', async () => {
    fornecedores.push({
      id: 'fornecedor-1',
      razao_social: 'Fornecedor',
      ativo: true,
      excluido_em: null,
    } as Fornecedor);

    await request(servidor)
      .get('/api/v1/fornecedores')
      .set('Authorization', `Bearer ${token(PERFIS.GERENTE)}`)
      .expect(200)
      .expect(({ body }) => {
        expect((body as { total: number }).total).toBe(1);
      });
  });

  it('DELETE /api/v1/fornecedores/:id com admin faz soft delete e remove da listagem', async () => {
    fornecedores.push({
      id: 'fornecedor-1',
      razao_social: 'Fornecedor',
      ativo: true,
      excluido_em: null,
    } as Fornecedor);

    await request(servidor)
      .delete('/api/v1/fornecedores/fornecedor-1')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .expect(200);

    await request(servidor)
      .get('/api/v1/fornecedores')
      .set('Authorization', `Bearer ${token(PERFIS.GERENTE)}`)
      .expect(({ body }) => {
        expect((body as { dados: unknown[] }).dados).toHaveLength(0);
      });
  });
});
