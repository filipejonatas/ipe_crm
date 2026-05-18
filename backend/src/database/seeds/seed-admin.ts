import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/data-source';
import { PerfilUsuario, Usuario } from '../../modules/usuarios/usuario.entity';

async function seedAdmin() {
  await dataSource.initialize();

  const usuariosRepository = dataSource.getRepository(Usuario);
  const existente = await usuariosRepository.findOne({
    where: { email: 'admin@ipecrm.com' },
    withDeleted: true,
  });

  if (existente) {
    await dataSource.destroy();
    return;
  }

  await usuariosRepository.save(
    usuariosRepository.create({
      nome: 'Admin',
      email: 'admin@ipecrm.com',
      senha_hash: await bcrypt.hash('Admin@1234', 10),
      perfil: PerfilUsuario.ADMIN,
      ativo: true,
    }),
  );

  await dataSource.destroy();
}

void seedAdmin().catch(async (error: unknown) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
