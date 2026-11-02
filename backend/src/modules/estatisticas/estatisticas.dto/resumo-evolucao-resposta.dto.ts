export class ResumoEvolucaoExercicioDto {
  exercicioId: number;
  nomeExercicio: string;
  treinoId: number;
  tituloTreino: string;
  cargaInicial: number;
  cargaAtual: number;
  // cargaAtual - cargaInicial, em kg.
  evolucaoCarga: number;
  // Nulo quando a carga inicial é zero (percentual indefinido).
  evolucaoPercentual: number | null;
  quantidadeRegistros: number;
}
