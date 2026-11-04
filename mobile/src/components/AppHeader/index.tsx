import { View, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { cores } from "../../theme/cores";
import type { TNavigationScreenProps } from "../../Routes";

interface AppHeaderProps {
  // Nas telas empilhadas o ícone da esquerda vira "voltar"; nas abas, abre a
  // conta do usuário.
  aoVoltar?: () => void;
}

export const AppHeader = ({ aoVoltar }: AppHeaderProps) => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { sair } = useAuth();
  const insets = useSafeAreaInsets();

  const confirmarSaida = () => {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: sair },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.pill}>
        <TouchableOpacity
          style={styles.botaoLateral}
          onPress={aoVoltar ?? (() => navigation.navigate("Account"))}
        >
          <Ionicons
            name={aoVoltar ? "arrow-back" : "person"}
            size={22}
            color={cores.texto}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Main", { screen: "Home" })}
        >
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoLateral} onPress={confirmarSaida}>
          <Ionicons name="log-out-outline" size={22} color={cores.texto} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: cores.fundo,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: cores.cartaoClaro,
    borderRadius: 24,
    paddingHorizontal: 10,
    height: 48,
  },
  botaoLateral: { padding: 4 },
  logo: { width: 34, height: 34, borderRadius: 8 },
});
