import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

import { cores } from "../../theme/cores";
import {
  formatarCarga,
  formatarData,
} from "../../helpers/formatarCarga/formatarCarga";

export interface PontoEvolucao {
  carga: number;
  registradoEm: string;
}

interface GraficoEvolucaoProps {
  historico: PontoEvolucao[];
}

const ALTURA = 180;
const MARGEM_HORIZONTAL = 12;
const MARGEM_TOPO = 40;
const MARGEM_BASE = 36;

// Com muitos registros, rotula só o primeiro, o do meio e o último para os
// textos não se sobreporem.
const obterIndicesRotulados = (quantidade: number): number[] => {
  if (quantidade <= 4) return [...Array(quantidade).keys()];
  return [0, Math.floor((quantidade - 1) / 2), quantidade - 1];
};

export const GraficoEvolucao = ({ historico }: GraficoEvolucaoProps) => {
  const [largura, setLargura] = useState(0);

  if (historico.length === 0) {
    return <Text style={styles.semDados}>Sem registros de carga ainda.</Text>;
  }

  // Um único registro vira uma linha reta, para o gráfico não ficar vazio.
  const pontosGrafico =
    historico.length === 1 ? [historico[0], historico[0]] : historico;

  const cargas = pontosGrafico.map((ponto) => ponto.carga);
  const cargaMinima = Math.min(...cargas);
  const faixaCargas = Math.max(...cargas) - cargaMinima || 1;
  const larguraUtil = largura - MARGEM_HORIZONTAL * 2;
  const alturaUtil = ALTURA - MARGEM_TOPO - MARGEM_BASE;

  const coordenadas = pontosGrafico.map((ponto, indice) => ({
    ...ponto,
    x:
      MARGEM_HORIZONTAL +
      (indice * larguraUtil) / (pontosGrafico.length - 1),
    y:
      MARGEM_TOPO +
      (1 - (ponto.carga - cargaMinima) / faixaCargas) * alturaUtil,
  }));

  const caminhoLinha = coordenadas
    .map((ponto, indice) => `${indice === 0 ? "M" : "L"}${ponto.x},${ponto.y}`)
    .join(" ");
  const primeiro = coordenadas[0];
  const ultimo = coordenadas[coordenadas.length - 1];
  const caminhoArea = `${caminhoLinha} L${ultimo.x},${ALTURA} L${primeiro.x},${ALTURA} Z`;

  const indicesRotulados = obterIndicesRotulados(historico.length);
  const obterAlinhamento = (indice: number) =>
    indice === 0
      ? "start"
      : indice === coordenadas.length - 1
      ? "end"
      : "middle";

  return (
    <View
      style={styles.container}
      onLayout={(evento) => setLargura(evento.nativeEvent.layout.width)}
    >
      {largura > 0 && (
        <Svg width={largura} height={ALTURA}>
          <Path d={caminhoArea} fill={cores.ciano} />
          {indicesRotulados.map((indice) => {
            const ponto = coordenadas[indice];
            return (
              <SvgText
                key={`rotulo-${indice}`}
                x={ponto.x}
                y={ponto.y - 22}
                fill={cores.texto}
                fontSize={12}
                textAnchor={obterAlinhamento(indice)}
              >
                {`Foi ${formatarCarga(ponto.carga)}`}
              </SvgText>
            );
          })}
          {indicesRotulados.map((indice) => {
            const ponto = coordenadas[indice];
            return (
              <SvgText
                key={`data-${indice}`}
                x={ponto.x}
                y={ponto.y - 8}
                fill={cores.textoSecundario}
                fontSize={11}
                textAnchor={obterAlinhamento(indice)}
              >
                {formatarData(ponto.registradoEm)}
              </SvgText>
            );
          })}
          {coordenadas.map((ponto, indice) => (
            <Circle
              key={`ponto-${indice}`}
              cx={ponto.x}
              cy={ponto.y}
              r={4}
              fill={cores.destaque}
            />
          ))}
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", height: ALTURA },
  semDados: { color: cores.textoSecundario, fontSize: 14 },
});
