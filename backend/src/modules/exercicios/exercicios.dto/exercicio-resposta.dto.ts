export class ExercicioRespostaDto {
  id: number;
  subtreinoId: number;
  nome: string;
  cargaAtual: number;
  // Repetições de cada série, em ordem de criação (ex.: [12, 10, 8]).
  repeticoesPorSerie: number[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export class HistoricoCargaRespostaDto {
  id: number;
  carga: number;
  registradoEm: Date;
}
