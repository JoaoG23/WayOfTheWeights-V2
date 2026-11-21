import { Module } from '@nestjs/common';
import { ArmazenamentoArquivosService } from './armazenamento-arquivos.service';

@Module({
  providers: [ArmazenamentoArquivosService],
  exports: [ArmazenamentoArquivosService],
})
export class ArmazenamentoModule {}
