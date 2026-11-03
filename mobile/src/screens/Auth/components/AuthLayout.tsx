import React from "react";
import {
  View,
  Image,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { cores } from "../../../theme/cores";

interface AuthLayoutProps {
  children: React.ReactNode;
  // Rodapé fixo embaixo (ex.: "Caso você não tenha conta" + Registre-se).
  rodape: React.ReactNode;
}

export const AuthLayout = ({ children, rodape }: AuthLayoutProps) => (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <StatusBar style="dark" />
    <ScrollView
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.cabecalho}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.nomeApp}>WAY OF THE WEIGHTS</Text>
      </View>

      <View style={styles.formulario}>{children}</View>

      <View style={styles.rodape}>{rodape}</View>
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.destaque },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  cabecalho: { alignItems: "center", gap: 16 },
  logo: { width: 110, height: 110, borderRadius: 20 },
  nomeApp: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    color: cores.textoEscuro,
  },
  formulario: { marginVertical: 40, gap: 8 },
  rodape: { gap: 10 },
});
