import 'reflect-metadata';
import { config as carregarEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

carregarEnv({ path: join(__dirname, '..', '..', '.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
