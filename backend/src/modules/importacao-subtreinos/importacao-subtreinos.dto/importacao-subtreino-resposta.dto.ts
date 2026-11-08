export class ExercicioImportadoRespostaDto {
  id: number;
  nome: string;
  cargaAtual: number;
  repeticoesPorSerie: number[];
}

export class ImportacaoSubtreinoRespostaDto {
  // true quando o subtreino foi criado; false quando um existente foi atualizado.
  criado: boolean;
  id: number;
  treinoId: number;
  titulo: string;
  descricao: string | null;
  exercicios: ExercicioImportadoRespostaDto[];
}
