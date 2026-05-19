import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CriarTabelaFornecedores1715731000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fornecedores',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'razao_social', type: 'varchar', length: '180', isNullable: false },
          { name: 'nome_fantasia', type: 'varchar', length: '180', isNullable: true },
          { name: 'cnpj', type: 'varchar', length: '18', isUnique: true, isNullable: true },
          { name: 'telefone', type: 'varchar', length: '30', isNullable: true },
          { name: 'email', type: 'varchar', length: '180', isNullable: true },
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
    await queryRunner.dropTable('fornecedores');
  }
}
