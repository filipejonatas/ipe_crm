import 'reflect-metadata';
import { config as carregarEnv } from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

carregarEnv({ path: join(__dirname, '..', '..', '.env') });

const usarSslBanco = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: usarSslBanco,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
