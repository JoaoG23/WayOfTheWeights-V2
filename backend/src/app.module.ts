import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecuperacaoSenhaModule } from './modules/recuperacao-senha/recuperacao-senha.module';
import { ContasModule } from './modules/contas/contas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TreinosModule } from './modules/treinos/treinos.module';
import { SubtreinosModule } from './modules/subtreinos/subtreinos.module';
import { ImportacaoSubtreinosModule } from './modules/importacao-subtreinos/importacao-subtreinos.module';
import { ExerciciosModule } from './modules/exercicios/exercicios.module';
import { SeriesModule } from './modules/series/series.module';
import { EstatisticasModule } from './modules/estatisticas/estatisticas.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RecuperacaoSenhaModule,
    ContasModule,
    UsuariosModule,
    TreinosModule,
    SubtreinosModule,
    ImportacaoSubtreinosModule,
    ExerciciosModule,
    SeriesModule,
    EstatisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
