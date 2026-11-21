import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../../components/Card";
import { formatarData } from "../../../helpers/formatarCarga/formatarCarga";
import {
  adicionarDias,
  DIAS_NA_SEMANA,
  ehMesmoDia,
  formatarDiaMes,
  formatarHora,
  inicioDaSemana,
  ROTULOS_DIAS_DA_SEMANA,
} from "../../../helpers/semana/semana";
import {
  CHAVE_CONCLUSOES,
  ConclusaoTreino,
  listarConclusoes,
} from "../../Conclusoes/api";
import { cores } from "../../../theme/cores";

// Calendário semanal do dashboard: cada dia mostra os treinos concluídos
// (nome do treino, subtreino e data/hora da conclusão).
export const SemanaTreinos = () => {
  const [inicioSemana, setInicioSemana] = useState(() =>
    inicioDaSemana(new Date())
  );
  const hoje = new Date();
  const fimSemana = adicionarDias(inicioSemana, DIAS_NA_SEMANA);
  const ehSemanaAtual = ehMesmoDia(inicioSemana, inicioDaSemana(hoje));

  const { data: conclusoes = [], isLoading } = useQuery({
    queryKey: [...CHAVE_CONCLUSOES, inicioSemana.toISOString()],
    queryFn: () => listarConclusoes(inicioSemana, fimSemana),
  });

  const dias = Array.from({ length: DIAS_NA_SEMANA }, (_, indice) =>
    adicionarDias(inicioSemana, indice)
  );
  const conclusoesDoDia = (dia: Date): ConclusaoTreino[] =>
    conclusoes.filter((conclusao) =>
      ehMesmoDia(new Date(conclusao.concluidoEm), dia)
    );

  return (
    <Card>
      <View style={styles.cabecalho}>
        <TouchableOpacity
          onPress={() => setInicioSemana(adicionarDias(inicioSemana, -DIAS_NA_SEMANA))}
        >
          <Feather name="chevron-left" size={26} color={cores.texto} />
        </TouchableOpacity>
        <View style={styles.textosCabecalho}>
          <Text style={styles.titulo}>Treinos da semana</Text>
          <Text style={styles.periodo}>
            {formatarDiaMes(inicioSemana)} - {formatarDiaMes(adicionarDias(fimSemana, -1))}
            {isLoading ? "" : ` • ${conclusoes.length} concluído(s)`}
          </Text>
        </View>
        <TouchableOpacity
          disabled={ehSemanaAtual}
          style={ehSemanaAtual && styles.desabilitado}
          onPress={() => setInicioSemana(fimSemana)}
        >
          <Feather name="chevron-right" size={26} color={cores.texto} />
        </TouchableOpacity>
      </View>

      {dias.map((dia, indice) => {
        const conclusoesDia = conclusoesDoDia(dia);
        const ehHoje = ehMesmoDia(dia, hoje);

        return (
          <View key={dia.toISOString()} style={styles.linhaDia}>
            <View style={[styles.rotuloDia, ehHoje && styles.rotuloHoje]}>
              <Text style={[styles.textoDiaSemana, ehHoje && styles.textoHoje]}>
                {ROTULOS_DIAS_DA_SEMANA[indice]}
              </Text>
              <Text style={[styles.textoDiaMes, ehHoje && styles.textoHoje]}>
                {dia.getDate()}
              </Text>
            </View>

            <View style={styles.conclusoesDia}>
              {conclusoesDia.length === 0 ? (
                <Text style={styles.semTreino}>Sem treino</Text>
              ) : (
                conclusoesDia.map((conclusao) => (
                  <View key={conclusao.id} style={styles.conclusao}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={22}
                      color={cores.sucesso}
                    />
                    <View style={styles.textosConclusao}>
                      <Text style={styles.nomeTreino}>{conclusao.tituloTreino}</Text>
                      <Text style={styles.detalheConclusao}>
                        {conclusao.tituloSubtreino} • {formatarData(conclusao.concluidoEm)} às{" "}
                        {formatarHora(conclusao.concluidoEm)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  textosCabecalho: { flex: 1, alignItems: "center", gap: 2 },
  titulo: { fontSize: 18, fontWeight: "bold", color: cores.texto },
  periodo: { fontSize: 13, color: cores.textoSecundario },
  desabilitado: { opacity: 0.3 },
  linhaDia: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.cartaoClaro,
  },
  rotuloDia: {
    width: 48,
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 12,
  },
  rotuloHoje: { backgroundColor: cores.destaque },
  textoDiaSemana: { fontSize: 12, color: cores.textoSecundario },
  textoDiaMes: { fontSize: 17, fontWeight: "bold", color: cores.texto },
  textoHoje: { color: cores.textoEscuro },
  conclusoesDia: { flex: 1, gap: 8, justifyContent: "center", minHeight: 44 },
  semTreino: { fontSize: 14, color: cores.neutro },
  conclusao: { flexDirection: "row", alignItems: "center", gap: 8 },
  textosConclusao: { flex: 1, gap: 2 },
  nomeTreino: { fontSize: 15, fontWeight: "bold", color: cores.texto },
  detalheConclusao: { fontSize: 13, color: cores.textoSecundario },
});
