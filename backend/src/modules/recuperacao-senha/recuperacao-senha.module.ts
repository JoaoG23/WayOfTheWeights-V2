import { Module } from '@nestjs/common';
import { RecuperacaoSenhaController } from './recuperacao-senha.controller/recuperacao-senha.controller';
import { RecuperacaoSenhaService } from './recuperacao-senha.service/recuperacao-senha.service';
import { RecuperacaoSenhaRepositories } from './recuperacao-senha.repositories/recuperacao-senha.repositories';
import { CriptografiaModule } from '../../shared/criptografia/criptografia.module';
import { EmailModule } from '../../shared/email/email.module';

@Module({
  imports: [CriptografiaModule, EmailModule],
  controllers: [RecuperacaoSenhaController],
  providers: [RecuperacaoSenhaService, RecuperacaoSenhaRepositories],
})
export class RecuperacaoSenhaModule {}
