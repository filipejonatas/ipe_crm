import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CriarTabelaItensEstoque1715735000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'itens_estoque',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'codigo', type: 'varchar', length: '60', isNullable: true },
          { name: 'descricao', type: 'varchar', length: '180', isNullable: false },
          { name: 'marca', type: 'varchar', length: '120', isNullable: true },
          {
            name: 'categoria',
            type: 'enum',
            enumName: 'itens_estoque_categoria_enum',
            enum: ['filtro', 'pneu', 'ferramenta', 'peca', 'insumo', 'outro'],
            isNullable: false,
          },
          {
            name: 'unidade_medida',
            type: 'varchar',
            length: '20',
            default: "'un'",
            isNullable: false,
          },
          {
            name: 'saldo_atual',
            type: 'decimal',
            precision: 12,
            scale: 3,
            default: 0,
            isNullable: false,
          },
          {
            name: 'estoque_minimo',
            type: 'decimal',
            precision: 12,
            scale: 3,
            default: 0,
            isNullable: false,
          },
          { name: 'ativo', type: 'boolean', default: true, isNullable: false },
          { name: 'observacoes', type: 'text', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'atualizado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'excluido_em', type: 'timestamptz', isNullable: true },
        ],
        checks: [
          { name: 'chk_itens_estoque_saldo_atual_nao_negativo', expression: 'saldo_atual >= 0' },
          { name: 'chk_itens_estoque_minimo_nao_negativo', expression: 'estoque_minimo >= 0' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_itens_estoque_codigo_unico" ON "itens_estoque" ("codigo") WHERE "codigo" IS NOT NULL AND "excluido_em" IS NULL',
    );
    await queryRunner.createIndex(
      'itens_estoque',
      new TableIndex({ name: 'IDX_itens_estoque_categoria', columnNames: ['categoria'] }),
    );
    await queryRunner.createIndex(
      'itens_estoque',
      new TableIndex({ name: 'IDX_itens_estoque_ativo', columnNames: ['ativo'] }),
    );
    await queryRunner.createIndex(
      'itens_estoque',
      new TableIndex({ name: 'IDX_itens_estoque_excluido_em', columnNames: ['excluido_em'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('itens_estoque', 'IDX_itens_estoque_excluido_em');
    await queryRunner.dropIndex('itens_estoque', 'IDX_itens_estoque_ativo');
    await queryRunner.dropIndex('itens_estoque', 'IDX_itens_estoque_categoria');
    await queryRunner.query('DROP INDEX "IDX_itens_estoque_codigo_unico"');
    await queryRunner.dropTable('itens_estoque');
  }
}
