import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProtegerTabelaMigrations1715739000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('REVOKE ALL PRIVILEGES ON TABLE public.migrations FROM PUBLIC');

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
          EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.migrations FROM anon';
        END IF;

        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.migrations FROM authenticated';
        END IF;
      END
      $$
    `);

    await queryRunner.query('ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE public.migrations DISABLE ROW LEVEL SECURITY');
  }
}
