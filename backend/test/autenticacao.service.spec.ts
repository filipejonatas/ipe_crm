import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PERFIS } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import { AutenticacaoService } from '../src/modules/autenticacao/autenticacao.service';
import { Usuario } from '../src/modules/usuarios/usuario.entity';
import { UsuariosService } from '../src/modules/usuarios/usuarios.service';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let usuariosService: jest.Mocked<Pick<UsuariosService, 'buscarPorEmail'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const usuario = {
    id: 'usuario-1',
    nome: 'Admin',
    email: 'admin@ipecrm.com',
    perfil: PERFIS.ADMIN,
    ativo: true,
    senha_hash: '',
  } as Usuario;

  beforeEach(() => {
    usuariosService = {
      buscarPorEmail: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-assinado'),
    };

    service = new AutenticacaoService(
      usuariosService as UsuariosService,
      jwtService as JwtService,
      { get: jest.fn().mockReturnValue('8h') } as unknown as ConfigService,
    );
  });

  it('validarUsuario retorna usuario com credenciais validas', async () => {
    usuario.senha_hash = await bcrypt.hash('Admin@1234', 10);
    usuariosService.buscarPorEmail.mockResolvedValue(usuario);

    await expect(service.validarUsuario('admin@ipecrm.com', 'Admin@1234')).resolves.toEqual({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    });
  });

  it('validarUsuario retorna null com senha incorreta', async () => {
    usuario.senha_hash = await bcrypt.hash('Admin@1234', 10);
    usuariosService.buscarPorEmail.mockResolvedValue(usuario);

    await expect(service.validarUsuario('admin@ipecrm.com', 'senhaerrada')).resolves.toBeNull();
  });

  it('validarUsuario retorna null com usuario nao encontrado', async () => {
    usuariosService.buscarPorEmail.mockResolvedValue(null);

    await expect(
      service.validarUsuario('inexistente@ipecrm.com', 'Admin@1234'),
    ).resolves.toBeNull();
  });

  it('login retorna access_token e dados do usuario', async () => {
    await expect(
      service.login({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      }),
    ).resolves.toEqual({
      access_token: 'token-assinado',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  });
});
