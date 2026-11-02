import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContasModule } from './modules/contas/contas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TreinosModule } from './modules/treinos/treinos.module';
import { ExerciciosModule } from './modules/exercicios/exercicios.module';
import { EstatisticasModule } from './modules/estatisticas/estatisticas.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ContasModule,
    UsuariosModule,
    TreinosModule,
    ExerciciosModule,
    EstatisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
