import { ReactNode, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { cores } from "../../theme/cores";

interface IconeFlutuante {
  icone: keyof typeof MaterialCommunityIcons.glyphMap;
  tamanho: number;
  cor: string;
  posicao: ViewStyle;
  duracaoMs: number;
  atrasoMs: number;
  rotacaoGraus: number;
}

// Durações e atrasos diferentes para os pesos não flutuarem sincronizados.
const ICONES_FLUTUANTES: IconeFlutuante[] = [
  {
    icone: "dumbbell",
    tamanho: 54,
    cor: cores.destaque,
    posicao: { top: "16%", left: "6%" },
    duracaoMs: 3200,
    atrasoMs: 0,
    rotacaoGraus: -8,
  },
  {
    icone: "weight-kilogram",
    tamanho: 46,
    cor: cores.ciano,
    posicao: { top: "40%", right: "8%" },
    duracaoMs: 3800,
    atrasoMs: 600,
    rotacaoGraus: 6,
  },
  {
    icone: "kettlebell",
    tamanho: 50,
    cor: cores.destaque,
    posicao: { top: "64%", left: "10%" },
    duracaoMs: 3500,
    atrasoMs: 1200,
    rotacaoGraus: 5,
  },
  {
    icone: "weight-lifter",
    tamanho: 58,
    cor: cores.ciano,
    posicao: { bottom: "8%", right: "14%" },
    duracaoMs: 4200,
    atrasoMs: 300,
    rotacaoGraus: -6,
  },
];

const DESLOCAMENTO_VERTICAL = 10;

interface ElementoFlutuanteProps {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  animar: boolean;
  duracaoMs: number;
  atrasoMs: number;
  rotacaoGraus: number;
}

// Sobe/desce e balança suavemente em loop (driver nativo, fora da thread JS).
const ElementoFlutuante = ({
  children,
  style,
  animar,
  duracaoMs,
  atrasoMs,
  rotacaoGraus,
}: ElementoFlutuanteProps) => {
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animar) return;

    const configuracao = {
      duration: duracaoMs,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    };
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(progresso, { ...configuracao, toValue: 1 }),
        Animated.timing(progresso, { ...configuracao, toValue: 0 }),
      ])
    );
    const temporizador = setTimeout(() => animacao.start(), atrasoMs);

    return () => {
      clearTimeout(temporizador);
      animacao.stop();
    };
  }, [animar, progresso, duracaoMs, atrasoMs]);

  const translateY = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -DESLOCAMENTO_VERTICAL],
  });
  const rotate = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [`${-rotacaoGraus}deg`, `${rotacaoGraus}deg`],
  });

  return (
    <Animated.View style={[style, { transform: [{ translateY }, { rotate }] }]}>
      {children}
    </Animated.View>
  );
};

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

// "X", faixa diagonal e pesos flutuantes do design, atrás do conteúdo da
// tela. Deve ser o primeiro filho do container para ficar no fundo. Só anima
// enquanto a tela está em foco, para não gastar bateria em telas ocultas.
export const DecoracaoFundo = () => {
  const telaEmFoco = useIsFocused();
  const reduzirMovimento = useReduzirMovimento();
  const animar = telaEmFoco && !reduzirMovimento;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.faixaDiagonal} />

      <ElementoFlutuante
        style={styles.containerX}
        animar={animar}
        duracaoMs={3000}
        atrasoMs={0}
        rotacaoGraus={4}
      >
        <View style={[styles.barraX, { transform: [{ rotate: "45deg" }] }]} />
        <View style={[styles.barraX, { transform: [{ rotate: "-45deg" }] }]} />
      </ElementoFlutuante>

      {ICONES_FLUTUANTES.map((iconeFlutuante) => (
        <ElementoFlutuante
          key={iconeFlutuante.icone}
          style={[styles.icone, iconeFlutuante.posicao]}
          animar={animar}
          duracaoMs={iconeFlutuante.duracaoMs}
          atrasoMs={iconeFlutuante.atrasoMs}
          rotacaoGraus={iconeFlutuante.rotacaoGraus}
        >
          <MaterialCommunityIcons
            name={iconeFlutuante.icone}
            size={iconeFlutuante.tamanho}
            color={iconeFlutuante.cor}
          />
        </ElementoFlutuante>
      ))}
    </View>
  );
};

const TAMANHO_X = 64;
const ESPESSURA_BARRA_X = 16;

const styles = StyleSheet.create({
  containerX: {
    position: "absolute",
    top: 28,
    right: 28,
    width: TAMANHO_X,
    height: TAMANHO_X,
  },
  barraX: {
    position: "absolute",
    top: (TAMANHO_X - ESPESSURA_BARRA_X) / 2,
    left: 0,
    width: TAMANHO_X,
    height: ESPESSURA_BARRA_X,
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
  icone: {
    position: "absolute",
    opacity: 0.16,
  },
});
