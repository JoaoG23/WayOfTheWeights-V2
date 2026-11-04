import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cores } from "../../theme/cores";

interface ButtonFloatingProps {
  onPress: () => void;
}

const MARGEM_INFERIOR = 40;

export const ButtonFloating = ({ onPress }: ButtonFloatingProps) => {
  // Sobe acima da barra de navegação nativa do celular (gestos/3 botões).
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.button, { bottom: MARGEM_INFERIOR + insets.bottom }]}
      onPress={onPress}
    >
      <Ionicons name="add" size={30} color={cores.textoEscuro} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 58,
    height: 58,
    position: "absolute",
    right: 24,
    zIndex: 2,
    backgroundColor: cores.destaque,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
