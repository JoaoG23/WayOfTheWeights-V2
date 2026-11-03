import api from "../../services/api";
import { DadosTreino, Treino } from "./types/treinosTypes";

export const listarTreinos = async (): Promise<Treino[]> => {
  const response = await api.get<Treino[]>("/treinos");
  return response.data;
};

export const buscarTreino = async (id: number): Promise<Treino> => {
  const response = await api.get<Treino>(`/treinos/${id}`);
  return response.data;
};

export const criarTreino = async (dadosTreino: DadosTreino): Promise<Treino> => {
  const response = await api.post<Treino>("/treinos", dadosTreino);
  return response.data;
};

export const atualizarTreino = async (
  id: number,
  dadosTreino: DadosTreino
): Promise<Treino> => {
  const response = await api.put<Treino>(`/treinos/${id}`, dadosTreino);
  return response.data;
};

export const removerTreino = async (id: number): Promise<void> => {
  await api.delete(`/treinos/${id}`);
};
