import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class EstatisticasRepositories {
  constructor(private readonly prisma: PrismaService) {}

  // Traz só o primeiro registro do histórico (carga inicial) e a contagem,
  // evitando carregar o histórico inteiro de cada exercício.
  async listarExerciciosComCargaInicial(contaId: number, usuarioId: number) {
    return this.prisma.exercicio.findMany({
      where: { treino: { usuarioId, usuario: { contaId } } },
      orderBy: [{ treinoId: 'asc' }, { criadoEm: 'asc' }],
      select: {
        id: true,
        nome: true,
        carga: { select: { valor: true } },
        treino: { select: { id: true, titulo: true } },
        historicoCargas: {
          orderBy: { registradoEm: 'asc' },
          take: 1,
          select: { carga: { select: { valor: true } } },
        },
        _count: { select: { historicoCargas: true } },
      },
    });
  }
}
