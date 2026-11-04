import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { cores } from "../../theme/cores";

export const Carregando = () => (
  <View style={styles.centro}>
    <ActivityIndicator size="large" color={cores.destaque} />
  </View>
);

interface MensagemTelaProps {
  texto: string;
  icone?: keyof typeof MaterialCommunityIcons.glyphMap;
}

// Estado vazio ou de erro de uma tela/lista.
export const MensagemTela = ({
  texto,
  icone = "dumbbell",
}: MensagemTelaProps) => (
  <View style={styles.centro}>
    <MaterialCommunityIcons name={icone} size={56} color={cores.cartaoClaro} />
    <Text style={styles.texto}>{texto}</Text>
  </View>
);

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 16,
    textAlign: "center",
  },
});
