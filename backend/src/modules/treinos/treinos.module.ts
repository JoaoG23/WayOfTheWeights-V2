import { Module } from '@nestjs/common';
import { TreinosController } from './treinos.controller/treinos.controller';
import { TreinosService } from './treinos.service/treinos.service';
import { TreinosRepositories } from './treinos.repositories/treinos.repositories';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [TreinosController],
  providers: [TreinosService, TreinosRepositories],
  exports: [TreinosService],
})
export class TreinosModule {}
