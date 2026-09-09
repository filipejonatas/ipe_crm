import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarProximaTrocaOleoKm1715741000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE manutencoes_veiculo
      ADD COLUMN proxima_troca_oleo_km integer,
      ADD CONSTRAINT chk_proxima_troca_oleo_km CHECK (
        proxima_troca_oleo_km IS NULL OR (
          troca_oleo = true AND proxima_troca_oleo_km BETWEEN 1 AND 99999999
          AND (quilometragem IS NULL OR proxima_troca_oleo_km > quilometragem)
        )
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE manutencoes_veiculo
      DROP CONSTRAINT chk_proxima_troca_oleo_km,
      DROP COLUMN proxima_troca_oleo_km`);
  }
}
