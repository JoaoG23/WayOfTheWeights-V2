import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type DadosCriarSubtreino = {
  treinoId: number;
  titulo: string;
  descricao?: string;
};

export type DadosAtualizarSubtreino = Partial<{
  titulo: string;
  descricao: string;
}>;

@Injectable()
export class SubtreinosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: number) {
    return this.prisma.subtreino.findUnique({ where: { id } });
  }

  async contarPorTreino(treinoId: number) {
    return this.prisma.subtreino.count({ where: { treinoId } });
  }

  async listarPorTreino(treinoId: number) {
    return this.prisma.subtreino.findMany({
      where: { treinoId },
      orderBy: { id: 'asc' },
    });
  }

  async criar(dados: DadosCriarSubtreino) {
    return this.prisma.subtreino.create({ data: dados });
  }

  async atualizar(id: number, dados: DadosAtualizarSubtreino) {
    return this.prisma.subtreino.update({ where: { id }, data: dados });
  }

  // Exercícios, séries e histórico de cargas são removidos em cascata pelo
  // banco.
  async remover(id: number) {
    return this.prisma.subtreino.delete({ where: { id } });
  }
}
