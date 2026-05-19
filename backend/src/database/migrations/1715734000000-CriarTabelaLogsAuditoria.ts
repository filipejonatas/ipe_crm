import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarTabelaLogsAuditoria1715734000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'logs_auditoria',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'entidade', type: 'varchar', length: '80', isNullable: false },
          { name: 'entidade_id', type: 'varchar', length: '80', isNullable: false },
          {
            name: 'acao',
            type: 'enum',
            enum: ['criacao', 'edicao', 'exclusao'],
            isNullable: false,
          },
          { name: 'dados_anteriores', type: 'jsonb', isNullable: true },
          { name: 'dados_novos', type: 'jsonb', isNullable: true },
          { name: 'usuario_id', type: 'varchar', length: '80', isNullable: false },
          { name: 'usuario_nome', type: 'varchar', length: '180', isNullable: false },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('logs_auditoria');
  }
}
