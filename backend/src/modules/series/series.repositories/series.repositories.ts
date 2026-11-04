import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type DadosCriarSerie = {
  exercicioId: number;
  repeticoes: number;
};

@Injectable()
export class SeriesRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: number) {
    return this.prisma.serie.findUnique({ where: { id } });
  }

  // Ordem de criação = numeração da série (Série 1, 2, 3...).
  async listarPorExercicio(exercicioId: number) {
    return this.prisma.serie.findMany({
      where: { exercicioId },
      orderBy: { id: 'asc' },
    });
  }

  async criar(dados: DadosCriarSerie) {
    return this.prisma.serie.create({ data: dados });
  }

  async atualizarRepeticoes(id: number, repeticoes: number) {
    return this.prisma.serie.update({ where: { id }, data: { repeticoes } });
  }

  async remover(id: number) {
    return this.prisma.serie.delete({ where: { id } });
  }
}
