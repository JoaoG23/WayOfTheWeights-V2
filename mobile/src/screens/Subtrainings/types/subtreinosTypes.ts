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
