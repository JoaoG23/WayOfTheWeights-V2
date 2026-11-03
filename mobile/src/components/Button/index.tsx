import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { cores } from "../../theme/cores";

type Props = {
  onPress: () => void;
  title: string;
  // "dark": botão escuro usado sobre o fundo limão (login/cadastro).
  variant?: "success" | "danger" | "neutral" | "dark";
};

const CORES_POR_VARIANTE = {
  success: { fundo: cores.destaque, texto: cores.textoEscuro },
  danger: { fundo: cores.perigo, texto: cores.texto },
  neutral: { fundo: cores.cartaoClaro, texto: cores.texto },
  dark: { fundo: cores.fundo, texto: cores.texto },
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
