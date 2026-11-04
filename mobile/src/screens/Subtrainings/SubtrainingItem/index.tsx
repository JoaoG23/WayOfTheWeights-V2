import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Card } from "../../../components/Card";
import { Subtreino } from "../types/subtreinosTypes";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface SubtrainingItemProps {
  item: Subtreino;
}

export const SubtrainingItem = React.memo(({ item }: SubtrainingItemProps) => {
  const navigation = useNavigation<TNavigationScreenProps>();

  return (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate("SubtrainingDetail", {
          treinoId: item.treinoId,
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
        name="dumbbell"
        size={36}
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
    minHeight: 80,
  },
  info: { flex: 1, gap: 8 },
  titulo: { fontSize: 18, fontWeight: "bold", color: cores.texto },
  descricao: { fontSize: 13, color: cores.textoSecundario },
});
