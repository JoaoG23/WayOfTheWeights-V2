import { Module } from '@nestjs/common';
import { CriptografiaBcryptService } from './criptografia-bcrypt.service';

@Module({
  providers: [CriptografiaBcryptService],
  exports: [CriptografiaBcryptService],
})
export class CriptografiaModule {}
