import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PERFIS } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AutenticacaoController } from '../src/modules/autenticacao/autenticacao.controller';
import { AutenticacaoService } from '../src/modules/autenticacao/autenticacao.service';
import { EstrategiaJwt } from '../src/modules/autenticacao/estrategia-jwt';
import { EstrategiaLocal } from '../src/modules/autenticacao/estrategia-local';
import { Usuario } from '../src/modules/usuarios/usuario.entity';
import { UsuariosService } from '../src/modules/usuarios/usuarios.service';

describe('AutenticacaoController (e2e)', () => {
  let app: INestApplication;
  let servidor: App;
  let senhaHash: string;

  beforeAll(async () => {
    senhaHash = await bcrypt.hash('Admin@1234', 10);
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({ secret: 'segredo-teste', signOptions: { expiresIn: '1h' } }),
      ],
      controllers: [AutenticacaoController],
      providers: [
        AutenticacaoService,
        EstrategiaLocal,
        EstrategiaJwt,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((chave: string) => (chave === 'JWT_SECRET' ? 'segredo-teste' : '1h')),
          },
        },
        {
          provide: UsuariosService,
          useValue: {
            buscarPorEmail: jest.fn((email: string): Promise<Usuario | null> => {
              if (email !== 'admin@ipecrm.com') return Promise.resolve(null);
              return Promise.resolve({
                id: 'usuario-1',
                nome: 'Admin',
                email,
                perfil: PERFIS.ADMIN,
                ativo: true,
                senha_hash: senhaHash,
              } as Usuario);
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
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/autenticacao/login com credenciais validas retorna 200', async () => {
    const response = await request(servidor)
      .post('/api/v1/autenticacao/login')
      .send({ email: 'admin@ipecrm.com', senha: 'Admin@1234' })
      .expect(200);

    const body = response.body as { access_token?: unknown };
    expect(body.access_token).toEqual(expect.any(String));
  });

  it('POST /api/v1/autenticacao/login com senha errada retorna 401', () => {
    return request(servidor)
      .post('/api/v1/autenticacao/login')
      .send({ email: 'admin@ipecrm.com', senha: 'senhaerrada' })
      .expect(401);
  });

  it('POST /api/v1/autenticacao/login com email inexistente retorna 401', () => {
    return request(servidor)
      .post('/api/v1/autenticacao/login')
      .send({ email: 'inexistente@ipecrm.com', senha: 'Admin@1234' })
      .expect(401);
  });

  it('GET /api/v1/autenticacao/eu com token valido retorna 200', async () => {
    const loginResponse = await request(servidor)
      .post('/api/v1/autenticacao/login')
      .send({ email: 'admin@ipecrm.com', senha: 'Admin@1234' });
    const loginBody = loginResponse.body as { access_token: string };

    await request(servidor)
      .get('/api/v1/autenticacao/eu')
      .set('Authorization', `Bearer ${loginBody.access_token}`)
      .expect(200)
      .expect(({ body }) => {
        const bodyTipado = body as {
          id: string;
          email: string;
          perfil: string;
        };
        expect(bodyTipado).toMatchObject({
          id: 'usuario-1',
          email: 'admin@ipecrm.com',
          perfil: PERFIS.ADMIN,
        });
      });
  });

  it('GET /api/v1/autenticacao/eu sem token retorna 401', () => {
    return request(servidor).get('/api/v1/autenticacao/eu').expect(401);
  });
});
