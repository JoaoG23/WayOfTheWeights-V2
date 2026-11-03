import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Card } from "../../../components/Card";
import { Treino } from "../types/treinosTypes";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface TrainingItemProps {
  item: Treino;
}

export const TrainingItem = React.memo(({ item }: TrainingItemProps) => {
  const navigation = useNavigation<TNavigationScreenProps>();

  return (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate("TrainingDetail", {
          id: item.id,
          titulo: item.titulo,
        })
      }
    >
      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descricao}>{item.descricao || "Sem descrição"}</Text>
      </View>
      <MaterialCommunityIcons
        name="weight-lifter"
        size={40}
        color={cores.ciano}
      />
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 90,
  },
  info: { flex: 1, gap: 10 },
  titulo: { fontSize: 18, fontWeight: "bold", color: cores.texto },
  descricao: { fontSize: 13, color: cores.textoSecundario },
});
