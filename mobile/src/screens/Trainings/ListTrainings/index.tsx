import { useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { ButtonFloating } from "../../../components/ButtonFloating";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { TrainingItem } from "../TrainingItem";
import { listarTreinos } from "../api";
import { Treino } from "../types/treinosTypes";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

export const Trainings = () => {
  const navigation = useNavigation<TNavigationScreenProps>();

  const { data: treinos = [], isLoading, isError } = useQuery({
    queryKey: ["treinos"],
    queryFn: listarTreinos,
  });

  const renderItem = useCallback(
    ({ item }: { item: Treino }) => <TrainingItem item={item} />,
    []
  );
  const keyExtractor = useCallback((item: Treino) => item.id.toString(), []);

  const renderizarConteudo = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar seus treinos." />;
    if (treinos.length === 0) {
      return (
        <MensagemTela texto="Você ainda não tem treinos. Toque no + para criar o primeiro." />
      );
    }
    return (
      <FlatList
        data={treinos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <Text style={styles.titulo}>Seus Treinos</Text>
      {renderizarConteudo()}
      <ButtonFloating onPress={() => navigation.navigate("AddTraining")} />
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
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
});
