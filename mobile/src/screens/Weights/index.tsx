import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { Card } from "../../components/Card";
import { DecoracaoFundo } from "../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../components/Feedback";
import { formatarCarga } from "../../helpers/formatarCarga/formatarCarga";
import {
  buscarResumoEvolucao,
  CHAVE_RESUMO_EVOLUCAO,
  ResumoEvolucaoExercicio,
} from "./api";
import { cores } from "../../theme/cores";
import type { TNavigationScreenProps } from "../../Routes";

const obterCorEvolucao = (evolucaoCarga: number) =>
  evolucaoCarga > 0
    ? cores.destaque
    : evolucaoCarga < 0
    ? cores.perigo
    : cores.neutro;

const formatarEvolucao = (exercicio: ResumoEvolucaoExercicio) => {
  const sinal = exercicio.evolucaoCarga > 0 ? "+" : "";
  const percentual =
    exercicio.evolucaoPercentual === null
      ? ""
      : ` (${sinal}${exercicio.evolucaoPercentual.toLocaleString("pt-BR")}%)`;
  return `${sinal}${formatarCarga(exercicio.evolucaoCarga)}${percentual}`;
};

// Ranking da evolução de força: maior ganho de carga primeiro.
export const Weights = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { data: resumo = [], isLoading, isError } = useQuery({
    queryKey: CHAVE_RESUMO_EVOLUCAO,
    queryFn: buscarResumoEvolucao,
  });

  const exerciciosOrdenados = [...resumo].sort(
    (exercicioA, exercicioB) => exercicioB.evolucaoCarga - exercicioA.evolucaoCarga
  );

  const renderItem = useCallback(
    ({ item }: { item: ResumoEvolucaoExercicio }) => (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate("ExerciseDetail", {
            treinoId: item.treinoId,
            subtreinoId: item.subtreinoId,
            id: item.exercicioId,
          })
        }
      >
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nomeExercicio}</Text>
          <Text style={styles.treino}>
            {item.tituloTreino} • {item.tituloSubtreino}
          </Text>
          <Text
            style={[
              styles.evolucao,
              { color: obterCorEvolucao(item.evolucaoCarga) },
            ]}
          >
            {formatarEvolucao(item)}
          </Text>
        </View>
        <View style={styles.colunaCargas}>
          <Text style={styles.cargaAtual}>
            Foi {formatarCarga(item.cargaAtual)}
          </Text>
          <MaterialCommunityIcons
            name="chevron-double-up"
            size={24}
            color={cores.ciano}
          />
          <Text style={styles.cargaInicial}>
            Foi {formatarCarga(item.cargaInicial)}
          </Text>
        </View>
      </Card>
    ),
    [navigation]
  );
  const keyExtractor = useCallback(
    (item: ResumoEvolucaoExercicio) => item.exercicioId.toString(),
    []
  );

  const renderizarConteudo = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar sua evolução." />;
    if (exerciciosOrdenados.length === 0) {
      return (
        <MensagemTela
          icone="arm-flex"
          texto="Registre cargas nos seus exercícios para ver sua evolução aqui."
        />
      );
    }
    return (
      <FlatList
        data={exerciciosOrdenados}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <Text style={styles.titulo}>Evolução de Pesos</Text>
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1, gap: 4 },
  nome: { fontSize: 17, fontWeight: "bold", color: cores.texto },
  treino: { fontSize: 13, color: cores.textoSecundario },
  evolucao: { fontSize: 15, fontWeight: "bold", marginTop: 4 },
  colunaCargas: { alignItems: "flex-end" },
  cargaAtual: { fontSize: 17, fontWeight: "bold", color: cores.texto },
  cargaInicial: { fontSize: 13, color: cores.textoSecundario },
});
