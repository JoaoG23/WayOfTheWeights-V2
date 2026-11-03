import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Card } from "../../../components/Card";
import { formatarCarga } from "../../../helpers/formatarCarga/formatarCarga";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface ExerciseItemProps {
  treinoId: number;
  exercicioId: number;
  nome: string;
  cargaAtual: number;
  // Nome do treino, exibido na lista geral de exercícios.
  subtitulo?: string;
}

export const ExerciseItem = React.memo(
  ({ treinoId, exercicioId, nome, cargaAtual, subtitulo }: ExerciseItemProps) => {
    const navigation = useNavigation<TNavigationScreenProps>();

    return (
      <Card
        style={styles.card}
        onPress={() =>
          navigation.navigate("ExerciseDetail", { treinoId, id: exercicioId })
        }
      >
        <View style={styles.info}>
          <Text style={styles.nome}>{nome}</Text>
          {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
        </View>
        <View style={styles.carga}>
          <MaterialCommunityIcons name="dumbbell" size={22} color={cores.ciano} />
          <Text style={styles.textoCarga}>{formatarCarga(cargaAtual)}</Text>
        </View>
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1, gap: 6 },
  nome: { fontSize: 17, fontWeight: "bold", color: cores.texto },
  subtitulo: { fontSize: 13, color: cores.textoSecundario },
  carga: { alignItems: "center", gap: 2 },
  textoCarga: { fontSize: 15, fontWeight: "bold", color: cores.texto },
});
