import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarTabelaVeiculos1715732000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'veiculos',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'placa', type: 'varchar', length: '10', isUnique: true, isNullable: false },
          { name: 'modelo', type: 'varchar', length: '120', isNullable: false },
          { name: 'marca', type: 'varchar', length: '120', isNullable: false },
          { name: 'ano', type: 'integer', isNullable: true },
          { name: 'observacoes', type: 'text', isNullable: true },
          { name: 'ativo', type: 'boolean', default: true, isNullable: false },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'atualizado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'excluido_em', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('veiculos');
  }
}
