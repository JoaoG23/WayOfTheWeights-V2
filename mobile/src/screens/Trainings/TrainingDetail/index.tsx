import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { ButtonFloating } from "../../../components/ButtonFloating";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { SubtrainingItem } from "../../Subtrainings/SubtrainingItem";
import { listarSubtreinos } from "../../Subtrainings/api";
import {
  Subtreino,
  SUBTREINOS_MAXIMOS_POR_TREINO,
} from "../../Subtrainings/types/subtreinosTypes";
import { buscarTreino } from "../api";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

// Treino aberto: mostra os subtreinos (até 3), que abrigam os exercícios.
export const TrainingDetail = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { id, titulo } =
    useRoute<RouteProp<TScreenDefinition, "TrainingDetail">>().params;

  const { data: treino } = useQuery({
    queryKey: ["treino", id],
    queryFn: () => buscarTreino(id),
  });
  const {
    data: subtreinos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subtreinos", id],
    queryFn: () => listarSubtreinos(id),
  });

  const tituloTreino = treino?.titulo ?? titulo;
  const podeAdicionarSubtreino =
    subtreinos.length < SUBTREINOS_MAXIMOS_POR_TREINO;

  const renderItem = useCallback(
    ({ item }: { item: Subtreino }) => <SubtrainingItem item={item} />,
    []
  );
  const keyExtractor = useCallback((item: Subtreino) => item.id.toString(), []);

  const renderizarSubtreinos = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar os subtreinos." />;
    if (subtreinos.length === 0) {
      return (
        <MensagemTela texto="Este treino ainda não tem subtreinos. Toque no + para criar o primeiro (ex.: Peito)." />
      );
    }
    return (
      <FlatList
        data={subtreinos}
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
          <Text style={styles.titulo}>{tituloTreino}</Text>
          {treino?.descricao ? (
            <Text style={styles.descricao}>{treino.descricao}</Text>
          ) : null}
          <Text style={styles.contador}>
            Subtreinos {subtreinos.length}/{SUBTREINOS_MAXIMOS_POR_TREINO}
          </Text>
        </View>
        <View style={styles.acoes}>
          {podeAdicionarSubtreino && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ImportSubtraining", { treinoId: id })
              }
            >
              <Feather name="camera" size={22} color={cores.ciano} />
            </TouchableOpacity>
          )}
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

      {renderizarSubtreinos()}
      {podeAdicionarSubtreino && (
        <ButtonFloating
          onPress={() => navigation.navigate("AddSubtraining", { treinoId: id })}
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
  contador: { fontSize: 13, color: cores.ciano, fontWeight: "600" },
  acoes: { flexDirection: "row", gap: 18, paddingTop: 4 },
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
});
