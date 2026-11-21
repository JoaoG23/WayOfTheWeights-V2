import { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ButtonFloating } from "../../../components/ButtonFloating";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { ExerciseItem } from "../../Exercises/ExerciseItem";
import { listarExerciciosDoSubtreino } from "../../Exercises/api";
import { Exercicio } from "../../Exercises/types/exerciciosTypes";
import { buscarSubtreino } from "../api";
import { CHAVE_CONCLUSOES, registrarConclusao } from "../../Conclusoes/api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
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

  // Checklist do treino: o treino só conclui quando todos os exercícios
  // estão marcados.
  const queryClient = useQueryClient();
  const [treinando, setTreinando] = useState(false);
  const [exerciciosMarcados, setExerciciosMarcados] = useState<number[]>([]);

  const encerrarChecklist = () => {
    setTreinando(false);
    setExerciciosMarcados([]);
  };

  const { mutate: concluirTreino, isPending: concluindo } = useMutation({
    mutationFn: (exerciciosConcluidosIds: number[]) =>
      registrarConclusao(treinoId, id, exerciciosConcluidosIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_CONCLUSOES });
      Toast.show({
        type: "success",
        text1: "Treino concluído!",
        text2: `${tituloSubtreino} registrado no seu histórico.`,
      });
      encerrarChecklist();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível concluir o treino",
        text2: obterMensagemErro(erro, "Tente novamente"),
      });
    },
  });

  const alternarExercicio = useCallback(
    (exercicioId: number) => {
      if (concluindo) return;
      const marcadosAtualizados = exerciciosMarcados.includes(exercicioId)
        ? exerciciosMarcados.filter((marcadoId) => marcadoId !== exercicioId)
        : [...exerciciosMarcados, exercicioId];
      setExerciciosMarcados(marcadosAtualizados);
      if (marcadosAtualizados.length === exercicios.length) {
        concluirTreino(marcadosAtualizados);
      }
    },
    [concluindo, exerciciosMarcados, exercicios.length, concluirTreino]
  );

  const renderItem = useCallback(
    ({ item }: { item: Exercicio }) => (
      <ExerciseItem
        treinoId={treinoId}
        subtreinoId={item.subtreinoId}
        exercicioId={item.id}
        nome={item.nome}
        cargaAtual={item.cargaAtual}
        repeticoesPorSerie={item.repeticoesPorSerie}
        marcado={exerciciosMarcados.includes(item.id)}
        aoAlternar={treinando ? alternarExercicio : undefined}
      />
    ),
    [treinoId, treinando, exerciciosMarcados, alternarExercicio]
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
        extraData={exerciciosMarcados}
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
          {exercicios.length > 0 && (
            <TouchableOpacity
              onPress={treinando ? encerrarChecklist : () => setTreinando(true)}
            >
              <Feather
                name={treinando ? "x-square" : "check-square"}
                size={22}
                color={cores.sucesso}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ImportSubtraining", {
                treinoId,
                subtreinoId: id,
              })
            }
          >
            <Feather name="camera" size={22} color={cores.ciano} />
          </TouchableOpacity>
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

      {treinando && (
        <Text style={styles.progressoChecklist}>
          Treino em andamento: {exerciciosMarcados.length}/{exercicios.length}{" "}
          exercícios. Marque todos para concluir.
        </Text>
      )}

      {renderizarExercicios()}
      {!treinando && (
        <ButtonFloating
          onPress={() =>
            navigation.navigate("AddExercise", { treinoId, subtreinoId: id })
          }
        />
      )}
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
  progressoChecklist: {
    fontSize: 14,
    fontWeight: "600",
    color: cores.sucesso,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  acoes: { flexDirection: "row", gap: 18, paddingTop: 4 },
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
});
