import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CriarTabelaItemEstoqueVeiculos1715736000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'item_estoque_veiculos',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'item_estoque_id', type: 'uuid', isNullable: false },
          { name: 'veiculo_id', type: 'uuid', isNullable: false },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('item_estoque_veiculos', [
      new TableForeignKey({
        name: 'FK_item_estoque_veiculos_item',
        columnNames: ['item_estoque_id'],
        referencedTableName: 'itens_estoque',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_item_estoque_veiculos_veiculo',
        columnNames: ['veiculo_id'],
        referencedTableName: 'veiculos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
    await queryRunner.createIndex(
      'item_estoque_veiculos',
      new TableIndex({
        name: 'IDX_item_estoque_veiculos_item_veiculo_unico',
        columnNames: ['item_estoque_id', 'veiculo_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'item_estoque_veiculos',
      'IDX_item_estoque_veiculos_item_veiculo_unico',
    );
    await queryRunner.dropTable('item_estoque_veiculos');
  }
}
