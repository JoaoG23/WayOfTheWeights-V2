import api from "../../services/api";
import { Exercicio, HistoricoCarga } from "./types/exerciciosTypes";

const rotaExercicios = (treinoId: number) => `/treinos/${treinoId}/exercicios`;

export const listarExerciciosDoTreino = async (
  treinoId: number
): Promise<Exercicio[]> => {
  const response = await api.get<Exercicio[]>(rotaExercicios(treinoId));
  return response.data;
};

export const buscarExercicio = async (
  treinoId: number,
  id: number
): Promise<Exercicio> => {
  const response = await api.get<Exercicio>(`${rotaExercicios(treinoId)}/${id}`);
  return response.data;
};

export const listarHistoricoCargas = async (
  treinoId: number,
  id: number
): Promise<HistoricoCarga[]> => {
  const response = await api.get<HistoricoCarga[]>(
    `${rotaExercicios(treinoId)}/${id}/historico`
  );
  return response.data;
};

export const criarExercicio = async (
  treinoId: number,
  dadosExercicio: { nome: string; cargaAtual: number }
): Promise<Exercicio> => {
  const response = await api.post<Exercicio>(
    rotaExercicios(treinoId),
    dadosExercicio
  );
  return response.data;
};

// Cada carga nova gera um registro no histórico (regra do backend).
export const atualizarCargaExercicio = async (
  treinoId: number,
  id: number,
  cargaAtual: number
): Promise<Exercicio> => {
  const response = await api.put<Exercicio>(
    `${rotaExercicios(treinoId)}/${id}`,
    { cargaAtual }
  );
  return response.data;
};

export const removerExercicio = async (
  treinoId: number,
  id: number
): Promise<void> => {
  await api.delete(`${rotaExercicios(treinoId)}/${id}`);
};
