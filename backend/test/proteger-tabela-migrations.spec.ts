import { QueryRunner } from 'typeorm';
import { ProtegerTabelaMigrations1715739000000 } from '../src/database/migrations/1715739000000-ProtegerTabelaMigrations';

describe('ProtegerTabelaMigrations', () => {
  const migration = new ProtegerTabelaMigrations1715739000000();

  it('remove acesso dos papeis da Data API e habilita RLS', async () => {
    const query = jest.fn().mockResolvedValue(undefined);

    await migration.up({ query } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledWith(
      'REVOKE ALL PRIVILEGES ON TABLE public.migrations FROM PUBLIC',
    );
    expect(query).toHaveBeenCalledWith(expect.stringContaining("rolname = 'anon'"));
    expect(query).toHaveBeenCalledWith(expect.stringContaining("rolname = 'authenticated'"));
    expect(query).toHaveBeenCalledWith('ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY');
  });
});
