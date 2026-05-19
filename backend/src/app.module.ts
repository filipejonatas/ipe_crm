import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { criarOpcoesTypeOrmAsync } from './config/typeorm.config';
import { AutenticacaoModule } from './modules/autenticacao/autenticacao.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ConfiguracoesModule } from './modules/configuracoes/configuracoes.module';
import { EstoqueModule } from './modules/estoque/estoque.module';
import { FornecedoresModule } from './modules/fornecedores/fornecedores.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(criarOpcoesTypeOrmAsync()),
    AuditoriaModule,
    UsuariosModule,
    AutenticacaoModule,
    FornecedoresModule,
    VeiculosModule,
    EstoqueModule,
    ConfiguracoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
