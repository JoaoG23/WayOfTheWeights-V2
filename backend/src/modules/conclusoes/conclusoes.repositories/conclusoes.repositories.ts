import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type DadosCriarConclusao = {
  usuarioId: number;
  subtreinoId: number;
  tituloTreino: string;
  tituloSubtreino: string;
  totalExercicios: number;
  exercicios: { nome: string; cargaKg: number }[];
};

export type FiltroPeriodoConclusoes = {
  inicio?: Date;
  fim?: Date;
};

const INCLUIR_EXERCICIOS = {
  exercicios: {
    orderBy: { id: 'asc' },
    select: { nome: true, cargaKg: true },
  },
} as const;

// Limite de segurança da listagem (histórico completo pode crescer sem fim).
const MAXIMO_CONCLUSOES_LISTADAS = 200;

@Injectable()
export class ConclusoesRepositories {
  constructor(private readonly prisma: PrismaService) {}

  // Conclusão e exercícios marcados são gravados juntos (nested write do
  // Prisma é atômico).
  async criar(dados: DadosCriarConclusao) {
    return this.prisma.conclusaoTreino.create({
      data: {
        usuarioId: dados.usuarioId,
        subtreinoId: dados.subtreinoId,
        tituloTreino: dados.tituloTreino,
        tituloSubtreino: dados.tituloSubtreino,
        totalExercicios: dados.totalExercicios,
        exercicios: { create: dados.exercicios },
      },
      include: INCLUIR_EXERCICIOS,
    });
  }

  // Sempre restrita à conta (isolamento entre contas); mais recentes primeiro.
  async listarPorUsuarioNaConta(
    contaId: number,
    usuarioId: number,
    periodo: FiltroPeriodoConclusoes,
  ) {
    return this.prisma.conclusaoTreino.findMany({
      where: {
        usuarioId,
        usuario: { contaId },
        concluidoEm: { gte: periodo.inicio, lt: periodo.fim },
      },
      orderBy: [{ concluidoEm: 'desc' }, { id: 'desc' }],
      take: MAXIMO_CONCLUSOES_LISTADAS,
      include: INCLUIR_EXERCICIOS,
    });
  }
}
