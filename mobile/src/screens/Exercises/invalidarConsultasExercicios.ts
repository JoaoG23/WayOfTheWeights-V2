import { QueryClient } from "@tanstack/react-query";
import { CHAVE_RESUMO_EVOLUCAO } from "../Weights/api";

// Toda mudança em exercício (criar, nova carga, remover) reflete nas listas
// do treino, no detalhe/histórico e no resumo de evolução (Home, abas
// Exercícios e Pesos).
export const invalidarConsultasExercicios = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["exercicios"] });
  queryClient.invalidateQueries({ queryKey: ["exercicio"] });
  queryClient.invalidateQueries({ queryKey: ["historico"] });
  queryClient.invalidateQueries({ queryKey: CHAVE_RESUMO_EVOLUCAO });
};
