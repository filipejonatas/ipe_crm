import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarTabelaConfiguracoes1715733000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'configuracoes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'chave', type: 'varchar', length: '120', isUnique: true, isNullable: false },
          { name: 'valor', type: 'varchar', length: '255', isNullable: false },
          { name: 'descricao', type: 'varchar', length: '255', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'atualizado_em', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('configuracoes');
  }
}
