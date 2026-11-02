import { Module } from '@nestjs/common';
import { ExerciciosController } from './exercicios.controller/exercicios.controller';
import { ExerciciosService } from './exercicios.service/exercicios.service';
import { ExerciciosRepositories } from './exercicios.repositories/exercicios.repositories';
import { TreinosModule } from '../treinos/treinos.module';

@Module({
  imports: [TreinosModule],
  controllers: [ExerciciosController],
  providers: [ExerciciosService, ExerciciosRepositories],
})
export class ExerciciosModule {}
