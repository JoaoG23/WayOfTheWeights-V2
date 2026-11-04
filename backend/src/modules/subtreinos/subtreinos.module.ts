import { Module } from '@nestjs/common';
import { SubtreinosController } from './subtreinos.controller/subtreinos.controller';
import { SubtreinosService } from './subtreinos.service/subtreinos.service';
import { SubtreinosRepositories } from './subtreinos.repositories/subtreinos.repositories';
import { TreinosModule } from '../treinos/treinos.module';

@Module({
  imports: [TreinosModule],
  controllers: [SubtreinosController],
  providers: [SubtreinosService, SubtreinosRepositories],
  exports: [SubtreinosService],
})
export class SubtreinosModule {}
