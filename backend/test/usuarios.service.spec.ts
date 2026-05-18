import { NotFoundException } from '@nestjs/common';
import { PERFIS } from '@ipe_crm/shared';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PerfilUsuario, Usuario } from '../src/modules/usuarios/usuario.entity';
import { UsuariosService } from '../src/modules/usuarios/usuarios.service';

type MockRepository = jest.Mocked<
  Pick<Repository<Usuario>, 'create' | 'save' | 'findOne' | 'findAndCount'>
> & {
  createQueryBuilder: jest.Mock;
};

function criarUsuario(sobrescritas: Partial<Usuario> = {}): Usuario {
  return {
    id: 'usuario-1',
    nome: 'Admin',
    email: 'admin@ipecrm.com',
    senha_hash: 'hash',
    perfil: PERFIS.ADMIN,
    ativo: true,
    criado_em: new Date('2026-01-01T00:00:00.000Z'),
    atualizado_em: new Date('2026-01-01T00:00:00.000Z'),
    excluido_em: null,
    ...sobrescritas,
  };
}

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn((usuario: Partial<Usuario>) => criarUsuario(usuario)),
      save: jest.fn((usuario: Usuario) => Promise.resolve(usuario)),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new UsuariosService(repository as unknown as Repository<Usuario>);
  });

  it('criar salva com senha hasheada, nunca em texto puro', async () => {
    await service.criar({
      nome: 'Admin',
      email: 'admin@ipecrm.com',
      senha: 'Admin@1234',
      perfil: PerfilUsuario.ADMIN,
    });

    const usuarioCriado = repository.create.mock.calls[0]?.[0] as Usuario;
    expect(usuarioCriado.senha_hash).not.toBe('Admin@1234');
    await expect(bcrypt.compare('Admin@1234', usuarioCriado.senha_hash)).resolves.toBe(true);
  });

  it('buscarPorId lanca NotFoundException para id inexistente', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId('inexistente')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('buscarPorId lanca NotFoundException para usuario com soft delete', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.buscarPorId('usuario-excluido')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remover preenche excluido_em sem deletar o registro', async () => {
    const usuario = criarUsuario();
    repository.findOne.mockResolvedValue(usuario);

    await service.remover(usuario.id);

    expect(usuario.excluido_em).toBeInstanceOf(Date);
    expect(repository.save).toHaveBeenCalledWith(usuario);
  });

  it('atualizar atualiza apenas os campos permitidos', async () => {
    const usuario = criarUsuario({ senha_hash: 'hash-original' });
    repository.findOne.mockResolvedValue(usuario);

    await service.atualizar(usuario.id, {
      nome: 'Novo nome',
      perfil: PerfilUsuario.GERENTE,
      ativo: false,
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Novo nome',
        perfil: PerfilUsuario.GERENTE,
        ativo: false,
        senha_hash: 'hash-original',
      }),
    );
  });
});
