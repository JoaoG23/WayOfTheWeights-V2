import { Module } from '@nestjs/common';
import { ConclusoesController } from './conclusoes.controller/conclusoes.controller';
import { ConclusoesService } from './conclusoes.service/conclusoes.service';
import { ConclusoesRepositories } from './conclusoes.repositories/conclusoes.repositories';
import { TreinosModule } from '../treinos/treinos.module';
import { SubtreinosModule } from '../subtreinos/subtreinos.module';
import { ExerciciosModule } from '../exercicios/exercicios.module';

@Module({
  imports: [TreinosModule, SubtreinosModule, ExerciciosModule],
  controllers: [ConclusoesController],
  providers: [ConclusoesService, ConclusoesRepositories],
})
export class ConclusoesModule {}
