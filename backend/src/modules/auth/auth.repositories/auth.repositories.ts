import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuthRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarUsuarioPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }
}
