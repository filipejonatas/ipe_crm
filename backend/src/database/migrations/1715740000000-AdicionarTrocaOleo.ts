import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarTrocaOleo1715740000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE manutencoes_veiculo
      ADD COLUMN troca_oleo boolean NOT NULL DEFAULT false,
      ADD COLUMN proxima_troca_oleo date,
      ADD CONSTRAINT chk_manutencao_troca_oleo CHECK (
        (troca_oleo = false AND proxima_troca_oleo IS NULL) OR
        (troca_oleo = true AND proxima_troca_oleo IS NOT NULL AND proxima_troca_oleo > data_manutencao)
      )`);
    await queryRunner.query(`CREATE INDEX idx_manutencao_ultima_troca_oleo
      ON manutencoes_veiculo (veiculo_id, data_manutencao DESC, criado_em DESC, id DESC)
      WHERE troca_oleo = true AND excluido_em IS NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_manutencao_ultima_troca_oleo');
    await queryRunner.query(`ALTER TABLE manutencoes_veiculo
      DROP CONSTRAINT chk_manutencao_troca_oleo,
      DROP COLUMN proxima_troca_oleo,
      DROP COLUMN troca_oleo`);
  }
}
