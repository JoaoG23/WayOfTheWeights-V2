import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

@Injectable()
export class ContasRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: number) {
    return this.prisma.conta.findUnique({ where: { id } });
  }

  async contarUsuariosPorPerfil(contaId: number) {
    return this.prisma.usuario.groupBy({
      by: ['perfil'],
      where: { contaId },
      _count: { _all: true },
    });
  }

  async contarUsuariosDoPerfil(contaId: number, perfil: PerfilUsuario) {
    return this.prisma.usuario.count({ where: { contaId, perfil } });
  }

  async atualizarPlano(id: number, plano: PlanoConta) {
    return this.prisma.conta.update({ where: { id }, data: { plano } });
  }
}
