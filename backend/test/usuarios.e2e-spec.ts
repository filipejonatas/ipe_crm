import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PERFIS } from '@ipe_crm/shared';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GuardPerfis } from '../src/common';
import { EstrategiaJwt } from '../src/modules/autenticacao/estrategia-jwt';
import { PerfilUsuario, Usuario } from '../src/modules/usuarios/usuario.entity';
import { UsuariosController } from '../src/modules/usuarios/usuarios.controller';
import { UsuariosService } from '../src/modules/usuarios/usuarios.service';

describe('UsuariosController (e2e)', () => {
  let app: INestApplication;
  let servidor: App;
  let jwtService: JwtService;
  const usuarios: Usuario[] = [];

  interface CriarUsuarioTesteDto {
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  }

  beforeEach(async () => {
    usuarios.length = 0;

    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: 'segredo-teste' })],
      controllers: [UsuariosController],
      providers: [
        GuardPerfis,
        EstrategiaJwt,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'segredo-teste') },
        },
        {
          provide: UsuariosService,
          useValue: {
            criar: jest.fn((dto: CriarUsuarioTesteDto): Promise<Usuario> => {
              const usuario = {
                id: `usuario-${usuarios.length + 1}`,
                nome: dto.nome,
                email: dto.email,
                perfil: dto.perfil,
                ativo: true,
                criado_em: new Date(),
                atualizado_em: new Date(),
                excluido_em: null,
              } as Usuario;
              usuarios.push(usuario);
              return Promise.resolve(usuario);
            }),
            listar: jest.fn(() =>
              Promise.resolve({
                dados: usuarios.filter((usuario) => !usuario.excluido_em),
                total: usuarios.filter((usuario) => !usuario.excluido_em).length,
                pagina: 1,
                limite: 10,
              }),
            ),
            buscarPorId: jest.fn(),
            atualizar: jest.fn(),
            remover: jest.fn((id: string): Promise<void> => {
              const usuario = usuarios.find((item) => item.id === id);
              if (usuario) usuario.excluido_em = new Date();
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
    return jwtService.sign({ sub: 'usuario-token', email: 'teste@ipecrm.com', perfil });
  }

  it('POST /api/v1/usuarios sem token retorna 401', () => {
    return request(servidor)
      .post('/api/v1/usuarios')
      .send({
        nome: 'Novo Usuario',
        email: 'novo@ipecrm.com',
        senha: 'Admin@1234',
        perfil: PerfilUsuario.COMPRAS,
      })
      .expect(401);
  });

  it('POST /api/v1/usuarios com perfil nao-admin retorna 403', () => {
    return request(servidor)
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token(PERFIS.COMPRAS)}`)
      .send({
        nome: 'Novo Usuario',
        email: 'novo@ipecrm.com',
        senha: 'Admin@1234',
        perfil: PerfilUsuario.COMPRAS,
      })
      .expect(403);
  });

  it('POST /api/v1/usuarios com admin retorna 201 sem senha_hash', async () => {
    const response = await request(servidor)
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .send({
        nome: 'Novo Usuario',
        email: 'novo@ipecrm.com',
        senha: 'Admin@1234',
        perfil: PerfilUsuario.COMPRAS,
      })
      .expect(201);

    const body = response.body as { senha_hash?: string };
    expect(body.senha_hash).toBeUndefined();
  });

  it('GET /api/v1/usuarios com admin retorna 200 com lista paginada', async () => {
    usuarios.push({
      id: 'usuario-1',
      nome: 'Novo Usuario',
      email: 'novo@ipecrm.com',
      perfil: PERFIS.COMPRAS,
      ativo: true,
      criado_em: new Date(),
      atualizado_em: new Date(),
      excluido_em: null,
    } as Usuario);

    await request(servidor)
      .get('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .expect(200)
      .expect(({ body }) => {
        const bodyTipado = body as { total: number; dados: unknown[] };
        expect(bodyTipado.total).toBe(1);
        expect(bodyTipado.dados).toHaveLength(1);
      });
  });

  it('DELETE /api/v1/usuarios/:id com admin faz soft delete', async () => {
    usuarios.push({
      id: 'usuario-1',
      nome: 'Novo Usuario',
      email: 'novo@ipecrm.com',
      perfil: PERFIS.COMPRAS,
      ativo: true,
      criado_em: new Date(),
      atualizado_em: new Date(),
      excluido_em: null,
    } as Usuario);

    await request(servidor)
      .delete('/api/v1/usuarios/usuario-1')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .expect(200);

    await request(servidor)
      .get('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token(PERFIS.ADMIN)}`)
      .expect(({ body }) => {
        const bodyTipado = body as { dados: unknown[] };
        expect(bodyTipado.dados).toHaveLength(0);
      });
  });
});
