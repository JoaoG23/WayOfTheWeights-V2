import { Module } from '@nestjs/common';
import { ExerciciosController } from './exercicios.controller/exercicios.controller';
import { ExerciciosService } from './exercicios.service/exercicios.service';
import { ExerciciosRepositories } from './exercicios.repositories/exercicios.repositories';
import { SubtreinosModule } from '../subtreinos/subtreinos.module';

@Module({
  imports: [SubtreinosModule],
  controllers: [ExerciciosController],
  providers: [ExerciciosService, ExerciciosRepositories],
  exports: [ExerciciosService],
})
export class ExerciciosModule {}
