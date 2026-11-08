import api from "../../services/api";
import {
  DadosSubtreino,
  ImagemSelecionada,
  ResultadoImportacao,
  Subtreino,
  SubtreinoImportacao,
} from "./types/subtreinosTypes";

// A leitura das imagens pelo Gemini pode demorar.
const TEMPO_LIMITE_LEITURA_MS = 120_000;

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

// Envia as imagens (multipart) e recebe o JSON padronizado, sem gravar nada.
export const lerImagensDoSubtreino = async (
  treinoId: number,
  imagens: ImagemSelecionada[]
): Promise<SubtreinoImportacao> => {
  const formulario = new FormData();
  imagens.forEach((imagem) => {
    // Formato de arquivo do React Native para FormData.
    formulario.append("imagens", {
      uri: imagem.uri,
      name: imagem.nome,
      type: imagem.tipo,
    } as unknown as Blob);
  });

  const response = await api.post<SubtreinoImportacao>(
    `${rotaSubtreinos(treinoId)}/ocr`,
    formulario,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: TEMPO_LIMITE_LEITURA_MS,
    }
  );
  return response.data;
};

// Upsert por id: atualiza se o subtreino existir no treino, senão cria um novo.
export const importarSubtreino = async (
  treinoId: number,
  id: number,
  dadosSubtreino: SubtreinoImportacao
): Promise<ResultadoImportacao> => {
  const response = await api.put<ResultadoImportacao>(
    `${rotaSubtreinos(treinoId)}/${id}/importar`,
    dadosSubtreino
  );
  return response.data;
};
