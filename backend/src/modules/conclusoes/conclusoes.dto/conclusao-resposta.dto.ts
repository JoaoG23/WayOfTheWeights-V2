export class ExercicioConcluidoRespostaDto {
  nome: string;
  cargaAtual: number;
}

export class ConclusaoRespostaDto {
  id: number;
  usuarioId: number;
  // Nulo se o subtreino foi removido depois; o histórico permanece.
  subtreinoId: number | null;
  tituloTreino: string;
  tituloSubtreino: string;
  concluidoEm: Date;
  exercicios: ExercicioConcluidoRespostaDto[];
}
