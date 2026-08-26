import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CriarTabelasManutencoesVeiculo1715738000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'manutencoes_veiculo',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'veiculo_id', type: 'uuid', isNullable: false },
          { name: 'usuario_id', type: 'uuid', isNullable: false },
          { name: 'data_manutencao', type: 'date', isNullable: false },
          { name: 'placa_snapshot', type: 'varchar', length: '10', isNullable: false },
          { name: 'descricao', type: 'text', isNullable: false },
          { name: 'quilometragem', type: 'integer', isNullable: true },
          {
            name: 'custo_mao_obra',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'custo_total',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          { name: 'observacoes', type: 'text', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'atualizado_em', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'excluido_em', type: 'timestamptz', isNullable: true },
        ],
        checks: [
          {
            name: 'chk_manutencoes_veiculo_quilometragem_nao_negativa',
            expression: 'quilometragem IS NULL OR quilometragem >= 0',
          },
          {
            name: 'chk_manutencoes_veiculo_custo_mao_obra_nao_negativo',
            expression: 'custo_mao_obra >= 0',
          },
          {
            name: 'chk_manutencoes_veiculo_custo_total_nao_negativo',
            expression: 'custo_total >= 0',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('manutencoes_veiculo', [
      new TableForeignKey({
        name: 'FK_manutencoes_veiculo_veiculo',
        columnNames: ['veiculo_id'],
        referencedTableName: 'veiculos',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_manutencoes_veiculo_usuario',
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
      }),
    ]);

    for (const coluna of [
      'veiculo_id',
      'usuario_id',
      'data_manutencao',
      'placa_snapshot',
      'excluido_em',
    ]) {
      await queryRunner.createIndex(
        'manutencoes_veiculo',
        new TableIndex({ name: `IDX_manutencoes_veiculo_${coluna}`, columnNames: [coluna] }),
      );
    }

    await queryRunner.createTable(
      new Table({
        name: 'manutencao_pecas',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'manutencao_id', type: 'uuid', isNullable: false },
          { name: 'item_estoque_id', type: 'uuid', isNullable: true },
          { name: 'movimentacao_estoque_id', type: 'uuid', isNullable: true },
          { name: 'descricao_peca', type: 'varchar', length: '180', isNullable: false },
          { name: 'quantidade', type: 'decimal', precision: 12, scale: 3, isNullable: false },
          { name: 'preco_unitario', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'valor_total', type: 'decimal', precision: 12, scale: 2, isNullable: false },
          { name: 'criado_em', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
        checks: [
          { name: 'chk_manutencao_pecas_quantidade_positiva', expression: 'quantidade > 0' },
          {
            name: 'chk_manutencao_pecas_preco_unitario_nao_negativo',
            expression: 'preco_unitario >= 0',
          },
          { name: 'chk_manutencao_pecas_valor_total_nao_negativo', expression: 'valor_total >= 0' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('manutencao_pecas', [
      new TableForeignKey({
        name: 'FK_manutencao_pecas_manutencao',
        columnNames: ['manutencao_id'],
        referencedTableName: 'manutencoes_veiculo',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_manutencao_pecas_item',
        columnNames: ['item_estoque_id'],
        referencedTableName: 'itens_estoque',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_manutencao_pecas_movimentacao',
        columnNames: ['movimentacao_estoque_id'],
        referencedTableName: 'movimentacoes_estoque',
        referencedColumnNames: ['id'],
      }),
    ]);

    for (const coluna of ['manutencao_id', 'item_estoque_id', 'movimentacao_estoque_id']) {
      await queryRunner.createIndex(
        'manutencao_pecas',
        new TableIndex({ name: `IDX_manutencao_pecas_${coluna}`, columnNames: [coluna] }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const coluna of ['movimentacao_estoque_id', 'item_estoque_id', 'manutencao_id']) {
      await queryRunner.dropIndex('manutencao_pecas', `IDX_manutencao_pecas_${coluna}`);
    }
    await queryRunner.dropTable('manutencao_pecas');

    for (const coluna of [
      'excluido_em',
      'placa_snapshot',
      'data_manutencao',
      'usuario_id',
      'veiculo_id',
    ]) {
      await queryRunner.dropIndex('manutencoes_veiculo', `IDX_manutencoes_veiculo_${coluna}`);
    }
    await queryRunner.dropTable('manutencoes_veiculo');
  }
}
