import { join } from 'node:path';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export function criarOpcoesTypeOrmAsync(): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'mysql' as const,
      host: configService.get<string>('DB_HOST'),
      port: Number(configService.get<string>('DB_PORT') ?? 3306),
      username: configService.get<string>('DB_USER'),
      password: configService.get<string>('DB_PASS'),
      database: configService.get<string>('DB_NAME'),
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
      synchronize: false,
      logging: configService.get<string>('NODE_ENV') !== 'production',
    }),
  };
}
