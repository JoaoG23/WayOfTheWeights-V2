import api from "../../services/api";

export interface ExercicioConcluido {
  nome: string;
  cargaAtual: number;
}

// Resposta de /conclusoes: um treino (subtreino) concluído no checklist.
export interface ConclusaoTreino {
  id: number;
  usuarioId: number;
  // Nulo se o subtreino foi removido depois; o histórico permanece.
  subtreinoId: number | null;
  tituloTreino: string;
  tituloSubtreino: string;
  concluidoEm: string;
  // Exercícios do subtreino na conclusão; `completo` quando todos foram marcados.
  totalExercicios: number;
  completo: boolean;
  exercicios: ExercicioConcluido[];
}

export const CHAVE_CONCLUSOES = ["conclusoes"];

// Início inclusivo, fim exclusivo.
export const listarConclusoes = async (
  inicio: Date,
  fim: Date
): Promise<ConclusaoTreino[]> => {
  const response = await api.get<ConclusaoTreino[]>("/conclusoes", {
    params: { inicio: inicio.toISOString(), fim: fim.toISOString() },
  });
  return response.data;
};

// Todos os exercícios do subtreino (conclusão completa) ou só alguns (parcial).
export const registrarConclusao = async (
  treinoId: number,
  subtreinoId: number,
  exerciciosConcluidosIds: number[]
): Promise<ConclusaoTreino> => {
  const response = await api.post<ConclusaoTreino>(
    `/treinos/${treinoId}/subtreinos/${subtreinoId}/conclusoes`,
    { exerciciosConcluidosIds }
  );
  return response.data;
};
