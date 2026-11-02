import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CriptografiaBcryptService {
  private readonly saltRounds = 10;

  async criptografarSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, this.saltRounds);
  }

  async verificarSenhasCombinam(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }
}
