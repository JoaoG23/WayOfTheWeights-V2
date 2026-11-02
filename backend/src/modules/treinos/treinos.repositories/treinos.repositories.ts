import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export type DadosCriarTreino = {
  usuarioId: number;
  titulo: string;
  descricao?: string;
};

export type DadosAtualizarTreino = Partial<{
  titulo: string;
  descricao: string;
}>;

@Injectable()
export class TreinosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorIdNaConta(contaId: number, id: number) {
    return this.prisma.treino.findFirst({
      where: { id, usuario: { contaId } },
    });
  }

  async listarPorUsuarioNaConta(contaId: number, usuarioId: number) {
    return this.prisma.treino.findMany({
      where: { usuarioId, usuario: { contaId } },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async criar(dados: DadosCriarTreino) {
    return this.prisma.treino.create({ data: dados });
  }

  async atualizar(id: number, dados: DadosAtualizarTreino) {
    return this.prisma.treino.update({ where: { id }, data: dados });
  }

  // Exercícios e histórico de cargas são removidos em cascata pelo banco.
  async remover(id: number) {
    return this.prisma.treino.delete({ where: { id } });
  }
}
