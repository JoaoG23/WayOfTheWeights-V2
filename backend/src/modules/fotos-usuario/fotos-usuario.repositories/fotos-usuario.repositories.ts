import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FotosUsuarioRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarNomeArquivo(usuarioId: number): Promise<string | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { fotoArquivo: true },
    });
    return usuario?.fotoArquivo ?? null;
  }

  async atualizarNomeArquivo(usuarioId: number, nomeArquivo: string | null) {
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { fotoArquivo: nomeArquivo },
      select: { id: true },
    });
  }
}
