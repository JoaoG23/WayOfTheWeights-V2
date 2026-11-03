import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { ButtonFloating } from "../../../components/ButtonFloating";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { ExerciseItem } from "../../Exercises/ExerciseItem";
import { listarExerciciosDoTreino } from "../../Exercises/api";
import { Exercicio } from "../../Exercises/types/exerciciosTypes";
import { buscarTreino } from "../api";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const TrainingDetail = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { id, titulo } =
    useRoute<RouteProp<TScreenDefinition, "TrainingDetail">>().params;

  const { data: treino } = useQuery({
    queryKey: ["treino", id],
    queryFn: () => buscarTreino(id),
  });
  const {
    data: exercicios = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exercicios", id],
    queryFn: () => listarExerciciosDoTreino(id),
  });

  const tituloTreino = treino?.titulo ?? titulo;

  const renderItem = useCallback(
    ({ item }: { item: Exercicio }) => (
      <ExerciseItem
        treinoId={item.treinoId}
        exercicioId={item.id}
        nome={item.nome}
        cargaAtual={item.cargaAtual}
      />
    ),
    []
  );
  const keyExtractor = useCallback((item: Exercicio) => item.id.toString(), []);

  const renderizarExercicios = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar os exercícios." />;
    if (exercicios.length === 0) {
      return (
        <MensagemTela texto="Nenhum exercício neste treino. Toque no + para adicionar." />
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
      <View style={styles.cabecalho}>
        <View style={styles.textosCabecalho}>
          <Text style={styles.titulo}>{tituloTreino}</Text>
          {treino?.descricao ? (
            <Text style={styles.descricao}>{treino.descricao}</Text>
          ) : null}
        </View>
        <View style={styles.acoes}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditTraining", { id })}
          >
            <Feather name="edit-2" size={22} color={cores.texto} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("RemoveTraining", { id, titulo: tituloTreino })
            }
          >
            <Feather name="trash" size={22} color={cores.perigo} />
          </TouchableOpacity>
        </View>
      </View>

      {renderizarExercicios()}
      <ButtonFloating
        onPress={() => navigation.navigate("AddExercise", { treinoId: id })}
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
