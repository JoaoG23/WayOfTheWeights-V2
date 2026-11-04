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

// A carga vive no catálogo compartilhado (tabela cargas); aqui só se lê o
// valor em kg.
const INCLUIR_CARGA = { carga: { select: { valor: true } } } as const;

// Exercício sempre sai com a carga e as repetições de cada série (em ordem de
// criação), para as listas mostrarem o resumo sem uma consulta por exercício.
const INCLUIR_EXERCICIO = {
  ...INCLUIR_CARGA,
  series: { select: { repeticoes: true }, orderBy: { id: 'asc' } },
} as const;

// Vincula ao catálogo pelo valor em kg (único), sem consulta extra.
const conectarCarga = (valorKg: number) => ({ connect: { valor: valorKg } });

@Injectable()
export class ExerciciosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: number) {
    return this.prisma.exercicio.findUnique({
      where: { id },
      include: INCLUIR_EXERCICIO,
    });
  }

  async listarPorTreino(treinoId: number) {
    return this.prisma.exercicio.findMany({
      where: { treinoId },
      orderBy: { criadoEm: 'asc' },
      include: INCLUIR_EXERCICIO,
    });
  }

  async listarHistoricoCargas(exercicioId: number) {
    return this.prisma.historicoCarga.findMany({
      where: { exercicioId },
      orderBy: { registradoEm: 'asc' },
      select: { id: true, registradoEm: true, ...INCLUIR_CARGA },
    });
  }

  // Exercício e primeiro registro do histórico são gravados juntos (nested
  // write do Prisma é atômico).
  async criarComHistorico(dados: DadosCriarExercicio) {
    return this.prisma.exercicio.create({
      data: {
        nome: dados.nome,
        treino: { connect: { id: dados.treinoId } },
        carga: conectarCarga(dados.cargaAtual),
        historicoCargas: {
          create: { carga: conectarCarga(dados.cargaAtual) },
        },
      },
      include: INCLUIR_EXERCICIO,
    });
  }

  async atualizarNome(id: number, nome?: string) {
    return this.prisma.exercicio.update({
      where: { id },
      data: { nome },
      include: INCLUIR_EXERCICIO,
    });
  }

  async atualizarCargaComHistorico(
    id: number,
    dados: DadosAtualizarCargaExercicio,
  ) {
    return this.prisma.exercicio.update({
      where: { id },
      data: {
        nome: dados.nome,
        carga: conectarCarga(dados.cargaAtual),
        historicoCargas: {
          create: { carga: conectarCarga(dados.cargaAtual) },
        },
      },
      include: INCLUIR_EXERCICIO,
    });
  }

  // Histórico de cargas é removido em cascata pelo banco.
  async remover(id: number) {
    return this.prisma.exercicio.delete({ where: { id } });
  }
}
