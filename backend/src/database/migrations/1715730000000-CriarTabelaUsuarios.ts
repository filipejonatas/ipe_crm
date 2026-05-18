import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarTabelaUsuarios1715730000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '180',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'senha_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'perfil',
            type: 'enum',
            enum: ['admin', 'compras', 'oficina', 'administrativo', 'gerente'],
            isNullable: false,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'criado_em',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'atualizado_em',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'excluido_em',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
  }
}
