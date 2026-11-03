import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { ExerciseItem } from "../ExerciseItem";
import {
  buscarResumoEvolucao,
  CHAVE_RESUMO_EVOLUCAO,
  ResumoEvolucaoExercicio,
} from "../../Weights/api";
import { cores } from "../../../theme/cores";

// Todos os exercícios do usuário, de todos os treinos. O resumo de evolução
// já traz exercício + treino + carga atual em uma única chamada.
export const Exercises = () => {
  const { data: exercicios = [], isLoading, isError } = useQuery({
    queryKey: CHAVE_RESUMO_EVOLUCAO,
    queryFn: buscarResumoEvolucao,
  });

  const renderItem = useCallback(
    ({ item }: { item: ResumoEvolucaoExercicio }) => (
      <ExerciseItem
        treinoId={item.treinoId}
        exercicioId={item.exercicioId}
        nome={item.nomeExercicio}
        cargaAtual={item.cargaAtual}
        subtitulo={item.tituloTreino}
      />
    ),
    []
  );
  const keyExtractor = useCallback(
    (item: ResumoEvolucaoExercicio) => item.exercicioId.toString(),
    []
  );

  const renderizarConteudo = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar os exercícios." />;
    if (exercicios.length === 0) {
      return (
        <MensagemTela texto="Nenhum exercício ainda. Adicione exercícios dentro de um treino." />
      );
    }
    return (
      <FlatList
        data={exercicios}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <Text style={styles.titulo}>Seus Exercícios</Text>
      {renderizarConteudo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: cores.texto,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  lista: { paddingHorizontal: 16, paddingBottom: 32 },
});
