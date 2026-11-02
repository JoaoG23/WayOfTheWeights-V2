import { Module } from '@nestjs/common';
import { EstatisticasController } from './estatisticas.controller/estatisticas.controller';
import { EstatisticasService } from './estatisticas.service/estatisticas.service';
import { EstatisticasRepositories } from './estatisticas.repositories/estatisticas.repositories';

@Module({
  controllers: [EstatisticasController],
  providers: [EstatisticasService, EstatisticasRepositories],
})
export class EstatisticasModule {}
