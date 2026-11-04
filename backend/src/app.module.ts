import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecuperacaoSenhaModule } from './modules/recuperacao-senha/recuperacao-senha.module';
import { ContasModule } from './modules/contas/contas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TreinosModule } from './modules/treinos/treinos.module';
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
    ExerciciosModule,
    SeriesModule,
    EstatisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
