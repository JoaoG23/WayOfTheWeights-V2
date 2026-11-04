import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RecuperacaoSenhaRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarUsuarioPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async buscarCodigoDoUsuario(usuarioId: number) {
    return this.prisma.codigoRecuperacaoSenha.findUnique({
      where: { usuarioId },
    });
  }

  // Um único código por usuário: pedir outro substitui o anterior e zera as
  // tentativas.
  async salvarCodigo(usuarioId: number, codigoHash: string, expiraEm: Date) {
    return this.prisma.codigoRecuperacaoSenha.upsert({
      where: { usuarioId },
      create: { usuarioId, codigoHash, expiraEm },
      update: { codigoHash, expiraEm, tentativas: 0, criadoEm: new Date() },
    });
  }

  async registrarTentativaErrada(usuarioId: number) {
    return this.prisma.codigoRecuperacaoSenha.update({
      where: { usuarioId },
      data: { tentativas: { increment: 1 } },
    });
  }

  // Troca da senha e consumo do código na mesma transação: o código nunca
  // fica utilizável depois de usado.
  async redefinirSenhaEApagarCodigo(usuarioId: number, senhaHash: string) {
    return this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { senhaHash },
      }),
      this.prisma.codigoRecuperacaoSenha.delete({ where: { usuarioId } }),
    ]);
  }
}
