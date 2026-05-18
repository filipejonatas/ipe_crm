import { join } from 'node:path';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

function usarSslBanco(valor?: string) {
  return valor === 'true' ? { rejectUnauthorized: false } : false;
}

export function criarOpcoesTypeOrmAsync(): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres' as const,
      url: configService.get<string>('DATABASE_URL'),
      host: configService.get<string>('DB_HOST'),
      port: Number(configService.get<string>('DB_PORT') ?? 5432),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASS'),
      database: configService.get<string>('DB_NAME'),
      ssl: usarSslBanco(configService.get<string>('DB_SSL')),
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
      synchronize: false,
      logging: configService.get<string>('NODE_ENV') !== 'production',
    }),
  };
}
