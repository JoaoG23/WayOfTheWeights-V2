import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SubtreinoImportacaoDto } from '../importacao-subtreinos.dto/subtreino-importacao.dto';

// Subtreino sempre sai com os exercícios, a carga (kg) e as repetições de cada
// série, em ordem de criação.
const INCLUIR_EXERCICIOS = {
  exercicios: {
    orderBy: { criadoEm: 'asc' },
    include: {
      carga: { select: { valor: true } },
      series: { select: { repeticoes: true }, orderBy: { id: 'asc' } },
    },
  },
} as const;

// Vincula ao catálogo pelo valor em kg (único), sem consulta extra.
const conectarCarga = (valorKg: number) => ({ connect: { valor: valorKg } });

const criarSeries = (repeticoesPorSerie: number[] = []) => ({
  create: repeticoesPorSerie.map((repeticoes) => ({ repeticoes })),
});

// Nomes são comparados sem diferenciar maiúsculas/minúsculas nem espaços nas
// pontas: "Supino reto " e "supino reto" são o mesmo exercício.
export const normalizarNome = (nome: string) =>
  nome.trim().toLocaleLowerCase('pt-BR');

@Injectable()
export class ImportacaoSubtreinosRepositories {
  constructor(private readonly prisma: PrismaService) {}

  // Busca restrita ao treino: um id de outro treino (ou conta) é tratado como
  // inexistente, sem revelar que ele existe.
  async buscarDoTreino(id: number, treinoId: number) {
    return this.prisma.subtreino.findFirst({
      where: { id, treinoId },
      include: INCLUIR_EXERCICIOS,
    });
  }

  // Subtreino, exercícios, séries e primeiro registro do histórico são
  // gravados juntos (nested write do Prisma é atômico).
  async criarComExercicios(treinoId: number, dados: SubtreinoImportacaoDto) {
    return this.prisma.subtreino.create({
      data: {
        treinoId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        exercicios: {
          create: dados.exercicios.map((exercicio) => ({
            nome: exercicio.nome,
            carga: conectarCarga(exercicio.cargaAtual),
            historicoCargas: {
              create: { carga: conectarCarga(exercicio.cargaAtual) },
            },
            series: criarSeries(exercicio.repeticoesPorSerie),
          })),
        },
      },
      include: INCLUIR_EXERCICIOS,
    });
  }

  // Exercícios que já existem (mesmo nome) são atualizados; os novos são
  // criados; os que não vieram no JSON ficam como estão. Tudo numa transação.
  async atualizarComExercicios(
    subtreinoAtual: NonNullable<
      Awaited<ReturnType<ImportacaoSubtreinosRepositories['buscarDoTreino']>>
    >,
    dados: SubtreinoImportacaoDto,
  ) {
    return this.prisma.$transaction(async (transacao) => {
      await transacao.subtreino.update({
        where: { id: subtreinoAtual.id },
        data: { titulo: dados.titulo, descricao: dados.descricao },
      });

      for (const exercicio of dados.exercicios) {
        const exercicioAtual = subtreinoAtual.exercicios.find(
          (existente) =>
            normalizarNome(existente.nome) === normalizarNome(exercicio.nome),
        );

        if (!exercicioAtual) {
          await transacao.exercicio.create({
            data: {
              nome: exercicio.nome,
              subtreino: { connect: { id: subtreinoAtual.id } },
              carga: conectarCarga(exercicio.cargaAtual),
              historicoCargas: {
                create: { carga: conectarCarga(exercicio.cargaAtual) },
              },
              series: criarSeries(exercicio.repeticoesPorSerie),
            },
          });
          continue;
        }

        const trocarSeries = (exercicio.repeticoesPorSerie?.length ?? 0) > 0;
        if (trocarSeries) {
          await transacao.serie.deleteMany({
            where: { exercicioId: exercicioAtual.id },
          });
        }
        // Só grava histórico quando a carga realmente muda.
        const cargaAlterada =
          exercicio.cargaAtual !== exercicioAtual.carga.valor;
        await transacao.exercicio.update({
          where: { id: exercicioAtual.id },
          data: {
            ...(cargaAlterada && {
              carga: conectarCarga(exercicio.cargaAtual),
              historicoCargas: {
                create: { carga: conectarCarga(exercicio.cargaAtual) },
              },
            }),
            ...(trocarSeries && {
              series: criarSeries(exercicio.repeticoesPorSerie),
            }),
          },
        });
      }

      return transacao.subtreino.findUniqueOrThrow({
        where: { id: subtreinoAtual.id },
        include: INCLUIR_EXERCICIOS,
      });
    });
  }
}
