import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PERFIS } from '@ipe_crm/shared';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GuardPerfis } from '../src/common';
import { EstrategiaJwt } from '../src/modules/autenticacao/estrategia-jwt';
import { Veiculo } from '../src/modules/veiculos/veiculo.entity';
import { VeiculosController } from '../src/modules/veiculos/veiculos.controller';
import { VeiculosService } from '../src/modules/veiculos/veiculos.service';

describe('VeiculosController (e2e)', () => {
  let app: INestApplication;
  let servidor: App;
  let jwtService: JwtService;
  const veiculos: Veiculo[] = [];

  beforeEach(async () => {
    veiculos.length = 0;
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: 'segredo-teste' })],
      controllers: [VeiculosController],
      providers: [
        GuardPerfis,
        EstrategiaJwt,
        { provide: ConfigService, useValue: { get: jest.fn(() => 'segredo-teste') } },
        {
          provide: VeiculosService,
          useValue: {
            criar: jest.fn((dto: Partial<Veiculo>) => {
              if (veiculos.some((veiculo) => veiculo.placa === dto.placa)) {
                throw new ConflictException('Placa ja cadastrada');
              }
              const veiculo = {
                id: `veiculo-${veiculos.length + 1}`,
                placa: dto.placa,
                modelo: dto.modelo,
                marca: dto.marca,
                ano: null,
                observacoes: null,
                ativo: true,
                criado_em: new Date(),
                atualizado_em: new Date(),
                excluido_em: null,
              } as Veiculo;
              veiculos.push(veiculo);
              return Promise.resolve(veiculo);
            }),
            listar: jest.fn(() =>
              Promise.resolve({
                dados: veiculos.filter((veiculo) => !veiculo.excluido_em),
                total: veiculos.filter((veiculo) => !veiculo.excluido_em).length,
                pagina: 1,
                limite: 10,
              }),
            ),
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
            remover: jest.fn((id: string) => {
              const veiculo = veiculos.find((item) => item.id === id);
              if (veiculo) veiculo.excluido_em = new Date();
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

  it('POST /api/v1/veiculos com admin retorna 201', () => {
    return request(servidor)
      .post('/api/v1/veiculos')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .send({ placa: 'ABC1234', modelo: 'Cargo', marca: 'Ford' })
      .expect(201);
  });

  it('POST /api/v1/veiculos com placa duplicada retorna 409', async () => {
    veiculos.push({
      id: 'veiculo-1',
      placa: 'ABC1234',
      modelo: 'Cargo',
      marca: 'Ford',
      excluido_em: null,
    } as Veiculo);

    await request(servidor)
      .post('/api/v1/veiculos')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .send({ placa: 'ABC1234', modelo: 'Cargo', marca: 'Ford' })
      .expect(409);
  });

  it('GET /api/v1/veiculos com perfil oficina retorna 200', () => {
    return request(servidor)
      .get('/api/v1/veiculos')
      .set('Authorization', `Bearer ${token(PERFIS.OFICINA)}`)
      .expect(200);
  });

  it('DELETE /api/v1/veiculos/:id com admin faz soft delete correto', async () => {
    veiculos.push({
      id: 'veiculo-1',
      placa: 'ABC1234',
      modelo: 'Cargo',
      marca: 'Ford',
      excluido_em: null,
    } as Veiculo);

    await request(servidor)
      .delete('/api/v1/veiculos/veiculo-1')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .expect(200);

    expect(veiculos[0].excluido_em).toBeInstanceOf(Date);
  });
});
