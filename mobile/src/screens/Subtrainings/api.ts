import api from "../../services/api";
import { DadosSubtreino, Subtreino } from "./types/subtreinosTypes";

const rotaSubtreinos = (treinoId: number) => `/treinos/${treinoId}/subtreinos`;

export const listarSubtreinos = async (
  treinoId: number
): Promise<Subtreino[]> => {
  const response = await api.get<Subtreino[]>(rotaSubtreinos(treinoId));
  return response.data;
};

export const buscarSubtreino = async (
  treinoId: number,
  id: number
): Promise<Subtreino> => {
  const response = await api.get<Subtreino>(`${rotaSubtreinos(treinoId)}/${id}`);
  return response.data;
};

export const criarSubtreino = async (
  treinoId: number,
  dadosSubtreino: DadosSubtreino
): Promise<Subtreino> => {
  const response = await api.post<Subtreino>(
    rotaSubtreinos(treinoId),
    dadosSubtreino
  );
  return response.data;
};

export const atualizarSubtreino = async (
  treinoId: number,
  id: number,
  dadosSubtreino: DadosSubtreino
): Promise<Subtreino> => {
  const response = await api.put<Subtreino>(
    `${rotaSubtreinos(treinoId)}/${id}`,
    dadosSubtreino
  );
  return response.data;
};

export const removerSubtreino = async (
  treinoId: number,
  id: number
): Promise<void> => {
  await api.delete(`${rotaSubtreinos(treinoId)}/${id}`);
};
