import api from "../../services/api";
import { Exercicio, HistoricoCarga, Serie } from "./types/exerciciosTypes";

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

const rotaSeries = (treinoId: number, exercicioId: number) =>
  `${rotaExercicios(treinoId)}/${exercicioId}/series`;

export const listarSeries = async (
  treinoId: number,
  exercicioId: number
): Promise<Serie[]> => {
  const response = await api.get<Serie[]>(rotaSeries(treinoId, exercicioId));
  return response.data;
};

export const criarSerie = async (
  treinoId: number,
  exercicioId: number,
  repeticoes: number
): Promise<Serie> => {
  const response = await api.post<Serie>(rotaSeries(treinoId, exercicioId), {
    repeticoes,
  });
  return response.data;
};

export const atualizarSerie = async (
  treinoId: number,
  exercicioId: number,
  id: number,
  repeticoes: number
): Promise<Serie> => {
  const response = await api.put<Serie>(
    `${rotaSeries(treinoId, exercicioId)}/${id}`,
    { repeticoes }
  );
  return response.data;
};

export const removerSerie = async (
  treinoId: number,
  exercicioId: number,
  id: number
): Promise<void> => {
  await api.delete(`${rotaSeries(treinoId, exercicioId)}/${id}`);
};
