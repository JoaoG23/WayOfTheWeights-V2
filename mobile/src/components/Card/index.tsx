import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { cores } from "../../theme/cores";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DURACAO_ENTRADA_MS = 350;

// Entra com fade ao aparecer (driver nativo), sem deslocar o layout.
export const Card = ({ children, onPress, style }: CardProps) => {
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: 1,
      duration: DURACAO_ENTRADA_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progresso]);

  const conteudo = onPress ? (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

  return (
    <Animated.View style={{ opacity: progresso }}>
      {conteudo}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.cartaoTranslucido,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
});
