import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { comOpacidade, cores } from "../../theme/cores";

type Props = {
  onPress: () => void;
  title: string;
  // "dark": botão escuro usado sobre o fundo limão (login/cadastro).
  variant?: "success" | "danger" | "neutral" | "dark";
};

// Fundo dos botões com 80% de opacidade (texto sempre opaco).
const OPACIDADE_FUNDO = 0.8;

const CORES_POR_VARIANTE = {
  success: { fundo: comOpacidade(cores.destaque, OPACIDADE_FUNDO), texto: cores.textoEscuro },
  danger: { fundo: comOpacidade(cores.perigo, OPACIDADE_FUNDO), texto: cores.texto },
  neutral: { fundo: comOpacidade(cores.cartaoClaro, OPACIDADE_FUNDO), texto: cores.texto },
  dark: { fundo: comOpacidade(cores.fundo, OPACIDADE_FUNDO), texto: cores.texto },
};

export const Button = ({ onPress, title, variant = "success" }: Props) => {
  const coresVariante = CORES_POR_VARIANTE[variant];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: coresVariante.fundo }]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: coresVariante.texto }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  text: {
    fontWeight: "700",
    fontSize: 16,
  },
});
