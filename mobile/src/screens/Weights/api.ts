import api from "../../services/api";

// Resposta de GET /estatisticas/resumo: evolução de carga por exercício.
// Usado na Home, na aba Exercícios e na aba Pesos.
export interface ResumoEvolucaoExercicio {
  exercicioId: number;
  nomeExercicio: string;
  treinoId: number;
  tituloTreino: string;
  subtreinoId: number;
  tituloSubtreino: string;
  cargaInicial: number;
  cargaAtual: number;
  evolucaoCarga: number;
  evolucaoPercentual: number | null;
  quantidadeRegistros: number;
}

export const CHAVE_RESUMO_EVOLUCAO = ["estatisticas-resumo"];

export const buscarResumoEvolucao = async (): Promise<
  ResumoEvolucaoExercicio[]
> => {
  const response = await api.get<ResumoEvolucaoExercicio[]>(
    "/estatisticas/resumo"
  );
  return response.data;
};
