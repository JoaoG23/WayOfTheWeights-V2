import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type DadosCriarExercicio = {
  treinoId: number;
  nome: string;
  cargaAtual: number;
};

export type DadosAtualizarCargaExercicio = {
  nome?: string;
  cargaAtual: number;
};

@Injectable()
export class ExerciciosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: number) {
    return this.prisma.exercicio.findUnique({ where: { id } });
  }

  async listarPorTreino(treinoId: number) {
    return this.prisma.exercicio.findMany({
      where: { treinoId },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async listarHistoricoCargas(exercicioId: number) {
    return this.prisma.historicoCarga.findMany({
      where: { exercicioId },
      orderBy: { registradoEm: 'asc' },
      select: { id: true, carga: true, registradoEm: true },
    });
  }

  // Exercício e primeiro registro do histórico são gravados juntos (nested
  // write do Prisma é atômico).
  async criarComHistorico(dados: DadosCriarExercicio) {
    return this.prisma.exercicio.create({
      data: {
        ...dados,
        historicoCargas: { create: { carga: dados.cargaAtual } },
      },
    });
  }

  async atualizarNome(id: number, nome?: string) {
    return this.prisma.exercicio.update({ where: { id }, data: { nome } });
  }

  async atualizarCargaComHistorico(
    id: number,
    dados: DadosAtualizarCargaExercicio,
  ) {
    return this.prisma.exercicio.update({
      where: { id },
      data: {
        ...dados,
        historicoCargas: { create: { carga: dados.cargaAtual } },
      },
    });
  }

  // Histórico de cargas é removido em cascata pelo banco.
  async remover(id: number) {
    return this.prisma.exercicio.delete({ where: { id } });
  }
}
