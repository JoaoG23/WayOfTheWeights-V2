import { View, StyleSheet } from "react-native";
import { cores } from "../../theme/cores";

// "X" e faixa diagonal limão do design, atrás do conteúdo da tela. Deve ser o
// primeiro filho do container para ficar no fundo.
export const DecoracaoFundo = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={[styles.barraX, { transform: [{ rotate: "45deg" }] }]} />
    <View style={[styles.barraX, { transform: [{ rotate: "-45deg" }] }]} />
    <View style={styles.faixaDiagonal} />
  </View>
);

const styles = StyleSheet.create({
  barraX: {
    position: "absolute",
    top: 36,
    right: 36,
    width: 64,
    height: 16,
    backgroundColor: cores.destaque,
  },
  faixaDiagonal: {
    position: "absolute",
    top: 300,
    left: -80,
    width: 700,
    height: 22,
    backgroundColor: cores.destaque,
    opacity: 0.35,
    transform: [{ rotate: "35deg" }],
  },
});
