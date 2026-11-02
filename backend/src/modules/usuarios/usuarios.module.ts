import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller/usuarios.controller';
import { ContaController } from './usuarios.controller/conta.controller';
import { UsuariosService } from './usuarios.service/usuarios.service';
import { UsuariosRepositories } from './usuarios.repositories/usuarios.repositories';
import { CriptografiaModule } from '../../shared/criptografia/criptografia.module';
import { ContasModule } from '../contas/contas.module';

@Module({
  imports: [CriptografiaModule, ContasModule],
  controllers: [UsuariosController, ContaController],
  providers: [UsuariosService, UsuariosRepositories],
  exports: [UsuariosService],
})
export class UsuariosModule {}
