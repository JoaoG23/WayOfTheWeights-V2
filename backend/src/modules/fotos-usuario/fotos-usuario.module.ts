import { Module } from '@nestjs/common';
import { FotosUsuarioController } from './fotos-usuario.controller/fotos-usuario.controller';
import { FotosUsuarioService } from './fotos-usuario.service/fotos-usuario.service';
import { FotosUsuarioRepositories } from './fotos-usuario.repositories/fotos-usuario.repositories';
import { ArmazenamentoModule } from '../../shared/armazenamento/armazenamento.module';

@Module({
  imports: [ArmazenamentoModule],
  controllers: [FotosUsuarioController],
  providers: [FotosUsuarioService, FotosUsuarioRepositories],
})
export class FotosUsuarioModule {}
