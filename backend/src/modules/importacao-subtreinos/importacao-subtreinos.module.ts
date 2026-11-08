import { Module } from '@nestjs/common';
import { ImportacaoSubtreinosController } from './importacao-subtreinos.controller/importacao-subtreinos.controller';
import { ImportacaoSubtreinosService } from './importacao-subtreinos.service/importacao-subtreinos.service';
import { ImportacaoSubtreinosRepositories } from './importacao-subtreinos.repositories/importacao-subtreinos.repositories';
import { TreinosModule } from '../treinos/treinos.module';
import { SubtreinosModule } from '../subtreinos/subtreinos.module';
import { GeminiModule } from '../../shared/gemini/gemini.module';

@Module({
  imports: [TreinosModule, SubtreinosModule, GeminiModule],
  controllers: [ImportacaoSubtreinosController],
  providers: [ImportacaoSubtreinosService, ImportacaoSubtreinosRepositories],
})
export class ImportacaoSubtreinosModule {}
