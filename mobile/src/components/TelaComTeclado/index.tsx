import { ReactNode } from "react";
import { KeyboardAvoidingView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { cores } from "../../theme/cores";

interface TelaComTecladoProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Container de telas com formulário: ao abrir o teclado, empurra o conteúdo
// para cima (o teclado não cobre o campo digitado). "padding" funciona no
// Android com edge-to-edge (Expo 57) e no iOS.
export const TelaComTeclado = ({ children, style }: TelaComTecladoProps) => (
  <KeyboardAvoidingView
    style={[styles.container, style]}
    behavior="padding"
  >
    {children}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
});
