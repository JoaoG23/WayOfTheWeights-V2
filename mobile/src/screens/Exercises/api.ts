import api from "../../services/api";
import { Exercicio, HistoricoCarga, Serie } from "./types/exerciciosTypes";

// Exercícios ficam dentro de um subtreino, que fica dentro de um treino.
const rotaExercicios = (treinoId: number, subtreinoId: number) =>
  `/treinos/${treinoId}/subtreinos/${subtreinoId}/exercicios`;

export const listarExerciciosDoSubtreino = async (
  treinoId: number,
  subtreinoId: number
): Promise<Exercicio[]> => {
  const response = await api.get<Exercicio[]>(
    rotaExercicios(treinoId, subtreinoId)
  );
  return response.data;
};

export const buscarExercicio = async (
  treinoId: number,
  subtreinoId: number,
  id: number
): Promise<Exercicio> => {
  const response = await api.get<Exercicio>(
    `${rotaExercicios(treinoId, subtreinoId)}/${id}`
  );
  return response.data;
};

export const listarHistoricoCargas = async (
  treinoId: number,
  subtreinoId: number,
  id: number
): Promise<HistoricoCarga[]> => {
  const response = await api.get<HistoricoCarga[]>(
    `${rotaExercicios(treinoId, subtreinoId)}/${id}/historico`
  );
  return response.data;
};

export const criarExercicio = async (
  treinoId: number,
  subtreinoId: number,
  dadosExercicio: { nome: string; cargaAtual: number }
): Promise<Exercicio> => {
  const response = await api.post<Exercicio>(
    rotaExercicios(treinoId, subtreinoId),
    dadosExercicio
  );
  return response.data;
};

// Cada carga nova gera um registro no histórico (regra do backend).
export const atualizarCargaExercicio = async (
  treinoId: number,
  subtreinoId: number,
  id: number,
  cargaAtual: number
): Promise<Exercicio> => {
  const response = await api.put<Exercicio>(
    `${rotaExercicios(treinoId, subtreinoId)}/${id}`,
    { cargaAtual }
  );
  return response.data;
};

export const removerExercicio = async (
  treinoId: number,
  subtreinoId: number,
  id: number
): Promise<void> => {
  await api.delete(`${rotaExercicios(treinoId, subtreinoId)}/${id}`);
};

const rotaSeries = (
  treinoId: number,
  subtreinoId: number,
  exercicioId: number
) => `${rotaExercicios(treinoId, subtreinoId)}/${exercicioId}/series`;

export const listarSeries = async (
  treinoId: number,
  subtreinoId: number,
  exercicioId: number
): Promise<Serie[]> => {
  const response = await api.get<Serie[]>(
    rotaSeries(treinoId, subtreinoId, exercicioId)
  );
  return response.data;
};

export const criarSerie = async (
  treinoId: number,
  subtreinoId: number,
  exercicioId: number,
  repeticoes: number
): Promise<Serie> => {
  const response = await api.post<Serie>(
    rotaSeries(treinoId, subtreinoId, exercicioId),
    { repeticoes }
  );
  return response.data;
};

export const atualizarSerie = async (
  treinoId: number,
  subtreinoId: number,
  exercicioId: number,
  id: number,
  repeticoes: number
): Promise<Serie> => {
  const response = await api.put<Serie>(
    `${rotaSeries(treinoId, subtreinoId, exercicioId)}/${id}`,
    { repeticoes }
  );
  return response.data;
};

export const removerSerie = async (
  treinoId: number,
  subtreinoId: number,
  exercicioId: number,
  id: number
): Promise<void> => {
  await api.delete(`${rotaSeries(treinoId, subtreinoId, exercicioId)}/${id}`);
};
