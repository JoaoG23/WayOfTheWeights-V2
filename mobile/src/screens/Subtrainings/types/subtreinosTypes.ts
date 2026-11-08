import { DadosTreino } from "../../Trainings/types/treinosTypes";

// Máximo de subtreinos por treino (mesma regra do backend).
export const SUBTREINOS_MAXIMOS_POR_TREINO = 3;

export interface Subtreino {
  id: number;
  treinoId: number;
  titulo: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// Mesmos campos do treino: título e descrição.
export type DadosSubtreino = DadosTreino;

// JSON padronizado de transferência de um subtreino (OCR e importação).
export interface ExercicioImportacao {
  nome: string;
  cargaAtual: number;
  repeticoesPorSerie: number[];
}

export interface SubtreinoImportacao {
  titulo: string;
  descricao?: string;
  exercicios: ExercicioImportacao[];
}

export interface ResultadoImportacao {
  // true: subtreino novo; false: um existente foi atualizado.
  criado: boolean;
  id: number;
  treinoId: number;
  titulo: string;
  descricao: string | null;
  exercicios: (ExercicioImportacao & { id: number })[];
}

// Imagem escolhida na galeria/câmera, pronta para o upload.
export interface ImagemSelecionada {
  uri: string;
  nome: string;
  tipo: string;
}
