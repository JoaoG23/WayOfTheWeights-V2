import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { cores } from "../../theme/cores";

const TAMANHO_ANILHA = 360;
const DESLOCAMENTO_VERTICAL = 14;
const ROTACAO_GRAUS = 6;
const DURACAO_MS = 5000;
// Visível o bastante para aparecer atrás dos cards translúcidos e dos campos.
const OPACIDADE_FUNDO = 0.18;

// Respeita a opção "reduzir movimento" do sistema (acessibilidade).
const useReduzirMovimento = () => {
  const [reduzirMovimento, setReduzirMovimento] = useState(true);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzirMovimento);
    const assinatura = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduzirMovimento
    );
    return () => assinatura.remove();
  }, []);

  return reduzirMovimento;
};

// Um peso (dumbbell) inclinado gigante, translúcido, flutuando no centro da tela, atrás do
// conteúdo. Deve ser o primeiro filho do container para ficar no fundo. Só
// anima com a tela em foco, para não gastar bateria em telas ocultas.
export const DecoracaoFundo = () => {
  const telaEmFoco = useIsFocused();
  const reduzirMovimento = useReduzirMovimento();
  const animar = telaEmFoco && !reduzirMovimento;
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animar) return;

    const configuracao = {
      duration: DURACAO_MS,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    };
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(progresso, { ...configuracao, toValue: 1 }),
        Animated.timing(progresso, { ...configuracao, toValue: 0 }),
      ])
    );
    animacao.start();

    return () => animacao.stop();
  }, [animar, progresso]);

  const translateY = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DESLOCAMENTO_VERTICAL],
  });
  const rotate = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [`${-ROTACAO_GRAUS}deg`, `${ROTACAO_GRAUS}deg`],
  });

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View
        style={[styles.anilha, { transform: [{ translateY }, { rotate }] }]}
      >
        <MaterialCommunityIcons
          name="dumbbell"
          size={TAMANHO_ANILHA}
          color={cores.destaque}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Camada absoluta atrás do conteúdo: não participa do layout das telas.
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  anilha: { opacity: OPACIDADE_FUNDO },
});
