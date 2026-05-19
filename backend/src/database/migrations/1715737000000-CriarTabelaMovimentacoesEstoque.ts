import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CriarTabelaMovimentacoesEstoque1715737000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'movimentacoes_estoque',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'item_estoque_id', type: 'uuid', isNullable: false },
          {
            name: 'tipo',
            type: 'enum',
            enumName: 'movimentacoes_estoque_tipo_enum',
            enum: ['entrada', 'saida', 'ajuste'],
            isNullable: false,
          },
          {
            name: 'origem',
            type: 'enum',
            enumName: 'movimentacoes_estoque_origem_enum',
            enum: ['saldo_inicial', 'utilizacao_oficina', 'compra', 'ajuste_manual'],
            isNullable: false,
          },
          { name: 'quantidade', type: 'decimal', precision: 12, scale: 3, isNullable: false },
          { name: 'saldo_anterior', type: 'decimal', precision: 12, scale: 3, isNullable: false },
          { name: 'saldo_posterior', type: 'decimal', precision: 12, scale: 3, isNullable: false },
          { name: 'veiculo_id', type: 'uuid', isNullable: true },
          { name: 'usuario_id', type: 'uuid', isNullable: false },
          { name: 'observacoes', type: 'text', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
        checks: [
          { name: 'chk_movimentacoes_estoque_quantidade_positiva', expression: 'quantidade > 0' },
          {
            name: 'chk_movimentacoes_estoque_saldo_anterior_nao_negativo',
            expression: 'saldo_anterior >= 0',
          },
          {
            name: 'chk_movimentacoes_estoque_saldo_posterior_nao_negativo',
            expression: 'saldo_posterior >= 0',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('movimentacoes_estoque', [
      new TableForeignKey({
        name: 'FK_movimentacoes_estoque_item',
        columnNames: ['item_estoque_id'],
        referencedTableName: 'itens_estoque',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_movimentacoes_estoque_veiculo',
        columnNames: ['veiculo_id'],
        referencedTableName: 'veiculos',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_movimentacoes_estoque_usuario',
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
      }),
    ]);

    for (const coluna of [
      'item_estoque_id',
      'tipo',
      'origem',
      'veiculo_id',
      'usuario_id',
      'criado_em',
    ]) {
      await queryRunner.createIndex(
        'movimentacoes_estoque',
        new TableIndex({ name: `IDX_movimentacoes_estoque_${coluna}`, columnNames: [coluna] }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const coluna of [
      'criado_em',
      'usuario_id',
      'veiculo_id',
      'origem',
      'tipo',
      'item_estoque_id',
    ]) {
      await queryRunner.dropIndex('movimentacoes_estoque', `IDX_movimentacoes_estoque_${coluna}`);
    }
    await queryRunner.dropTable('movimentacoes_estoque');
  }
}
