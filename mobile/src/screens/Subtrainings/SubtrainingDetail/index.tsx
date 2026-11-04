import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { ButtonFloating } from "../../../components/ButtonFloating";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { ExerciseItem } from "../../Exercises/ExerciseItem";
import { listarExerciciosDoSubtreino } from "../../Exercises/api";
import { Exercicio } from "../../Exercises/types/exerciciosTypes";
import { buscarSubtreino } from "../api";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

// Subtreino aberto: abriga os exercícios (com séries, cargas e histórico).
export const SubtrainingDetail = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, id, titulo } =
    useRoute<RouteProp<TScreenDefinition, "SubtrainingDetail">>().params;

  const { data: subtreino } = useQuery({
    queryKey: ["subtreino", treinoId, id],
    queryFn: () => buscarSubtreino(treinoId, id),
  });
  const {
    data: exercicios = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exercicios", id],
    queryFn: () => listarExerciciosDoSubtreino(treinoId, id),
  });

  const tituloSubtreino = subtreino?.titulo ?? titulo;

  const renderItem = useCallback(
    ({ item }: { item: Exercicio }) => (
      <ExerciseItem
        treinoId={treinoId}
        subtreinoId={item.subtreinoId}
        exercicioId={item.id}
        nome={item.nome}
        cargaAtual={item.cargaAtual}
        repeticoesPorSerie={item.repeticoesPorSerie}
      />
    ),
    [treinoId]
  );
  const keyExtractor = useCallback((item: Exercicio) => item.id.toString(), []);

  const renderizarExercicios = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar os exercícios." />;
    if (exercicios.length === 0) {
      return (
        <MensagemTela texto="Nenhum exercício neste subtreino. Toque no + para adicionar." />
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
      <View style={styles.cabecalho}>
        <View style={styles.textosCabecalho}>
          <Text style={styles.titulo}>{tituloSubtreino}</Text>
          {subtreino?.descricao ? (
            <Text style={styles.descricao}>{subtreino.descricao}</Text>
          ) : null}
        </View>
        <View style={styles.acoes}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditSubtraining", { treinoId, id })}
          >
            <Feather name="edit-2" size={22} color={cores.texto} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("RemoveSubtraining", {
                treinoId,
                id,
                titulo: tituloSubtreino,
              })
            }
          >
            <Feather name="trash" size={22} color={cores.perigo} />
          </TouchableOpacity>
        </View>
      </View>

      {renderizarExercicios()}
      <ButtonFloating
        onPress={() =>
          navigation.navigate("AddExercise", { treinoId, subtreinoId: id })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  textosCabecalho: { flex: 1, gap: 4 },
  titulo: { fontSize: 22, fontWeight: "bold", color: cores.texto },
  descricao: { fontSize: 14, color: cores.textoSecundario },
  acoes: { flexDirection: "row", gap: 18, paddingTop: 4 },
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
});
