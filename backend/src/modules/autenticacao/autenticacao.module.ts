import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { SignOptions } from 'jsonwebtoken';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { EstrategiaJwt } from './estrategia-jwt';
import { EstrategiaLocal } from './estrategia-local';

@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'dev_secret',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ??
            '8h') as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AutenticacaoController],
  providers: [AutenticacaoService, EstrategiaLocal, EstrategiaJwt],
  exports: [AutenticacaoService],
})
export class AutenticacaoModule {}
