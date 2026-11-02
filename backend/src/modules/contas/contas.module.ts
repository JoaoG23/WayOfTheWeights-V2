import { Module } from '@nestjs/common';
import { ContasController } from './contas.controller/contas.controller';
import { ContasService } from './contas.service/contas.service';
import { ContasRepositories } from './contas.repositories/contas.repositories';

@Module({
  controllers: [ContasController],
  providers: [ContasService, ContasRepositories],
  exports: [ContasService],
})
export class ContasModule {}
