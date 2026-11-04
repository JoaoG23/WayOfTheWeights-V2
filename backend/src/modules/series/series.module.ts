import { Module } from '@nestjs/common';
import { SeriesController } from './series.controller/series.controller';
import { SeriesService } from './series.service/series.service';
import { SeriesRepositories } from './series.repositories/series.repositories';
import { ExerciciosModule } from '../exercicios/exercicios.module';

@Module({
  imports: [ExerciciosModule],
  controllers: [SeriesController],
  providers: [SeriesService, SeriesRepositories],
})
export class SeriesModule {}
