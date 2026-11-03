import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cores } from "../../theme/cores";

interface ButtonFloatingProps {
  onPress: () => void;
}

export const ButtonFloating = ({ onPress }: ButtonFloatingProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="add" size={30} color={cores.textoEscuro} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 58,
    height: 58,
    position: "absolute",
    bottom: 24,
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
