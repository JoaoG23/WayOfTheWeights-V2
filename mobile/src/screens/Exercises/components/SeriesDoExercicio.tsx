import { useState } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import {
  atualizarSerie,
  criarSerie,
  listarSeries,
  removerSerie,
} from "../api";
import { Serie } from "../types/exerciciosTypes";
import {
  converterTextoEmRepeticoes,
  REGRAS_REPETICOES,
} from "../../../helpers/series/series";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";

interface SeriesDoExercicioProps {
  treinoId: number;
  subtreinoId: number;
  exercicioId: number;
}

interface DadosSerie {
  repeticoes: string;
}

// Séries do exercício, cada uma com as suas repetições. A numeração
// "Série 1, 2, 3" é a posição na lista (ordem de criação).
export const SeriesDoExercicio = ({
  treinoId,
  subtreinoId,
  exercicioId,
}: SeriesDoExercicioProps) => {
  const queryClient = useQueryClient();
  const [serieEmEdicao, setSerieEmEdicao] = useState<Serie | null>(null);
  const { control, handleSubmit, reset } = useForm<DadosSerie>({
    defaultValues: { repeticoes: "" },
  });

  const { data: series = [], isLoading } = useQuery({
    queryKey: ["series", subtreinoId, exercicioId],
    queryFn: () => listarSeries(treinoId, subtreinoId, exercicioId),
  });

  // As listas de exercícios mostram o resumo das séries, então também
  // precisam ser recarregadas.
  const aposAlterarSeries = () => {
    queryClient.invalidateQueries({ queryKey: ["series"] });
    queryClient.invalidateQueries({ queryKey: ["exercicios"] });
  };
  const avisarErro = (erro: unknown, mensagemPadrao: string) =>
    Toast.show({
      type: "error",
      text1: "Houve um erro",
      text2: obterMensagemErro(erro, mensagemPadrao),
    });

  const { mutate: salvarSerie, isPending: salvando } = useMutation({
    mutationFn: ({ repeticoes }: DadosSerie) => {
      const quantidadeRepeticoes = converterTextoEmRepeticoes(repeticoes);
      return serieEmEdicao
        ? atualizarSerie(
            treinoId,
            subtreinoId,
            exercicioId,
            serieEmEdicao.id,
            quantidadeRepeticoes
          )
        : criarSerie(treinoId, subtreinoId, exercicioId, quantidadeRepeticoes);
    },
    onSuccess: () => {
      aposAlterarSeries();
      setSerieEmEdicao(null);
      reset({ repeticoes: "" });
    },
    onError: (erro) => avisarErro(erro, "Erro ao salvar a série"),
  });

  const { mutate: excluirSerie } = useMutation({
    mutationFn: (id: number) => removerSerie(treinoId, subtreinoId, exercicioId, id),
    onSuccess: (_resposta, idRemovido) => {
      aposAlterarSeries();
      if (serieEmEdicao?.id === idRemovido) cancelarEdicao();
    },
    onError: (erro) => avisarErro(erro, "Erro ao remover a série"),
  });

  const iniciarEdicao = (serie: Serie) => {
    setSerieEmEdicao(serie);
    reset({ repeticoes: String(serie.repeticoes) });
  };

  function cancelarEdicao() {
    setSerieEmEdicao(null);
    reset({ repeticoes: "" });
  }

  const confirmarRemocao = (serie: Serie, numeroSerie: number) =>
    Alert.alert(
      "Remover série",
      `Remover a série ${numeroSerie} (${serie.repeticoes} repetições)?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => excluirSerie(serie.id),
        },
      ]
    );

  const numeroSerieEmEdicao = serieEmEdicao
    ? series.findIndex((serie) => serie.id === serieEmEdicao.id) + 1
    : 0;

  return (
    <Card>
      <Text style={styles.titulo}>Séries e Repetições</Text>

      {isLoading ? (
        <ActivityIndicator color={cores.destaque} />
      ) : series.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma série cadastrada ainda.</Text>
      ) : (
        series.map((serie, indice) => (
          <View key={serie.id} style={styles.linhaSerie}>
            <Text style={styles.textoSerie}>Série {indice + 1}</Text>
            <Text style={styles.textoRepeticoes}>
              {serie.repeticoes} repetições
            </Text>
            <TouchableOpacity onPress={() => iniciarEdicao(serie)}>
              <Feather name="edit-2" size={18} color={cores.texto} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmarRemocao(serie, indice + 1)}>
              <Feather name="trash" size={18} color={cores.perigo} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.formulario}>
        <Input
          name="repeticoes"
          control={control}
          label={
            serieEmEdicao
              ? `Repetições da série ${numeroSerieEmEdicao}`
              : "Repetições da nova série"
          }
          placeholder="Ex.: 12"
          keyboardType="number-pad"
          maxLength={3}
          required="Informe as repetições"
          rules={REGRAS_REPETICOES}
        />
        {salvando ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <View style={styles.botoes}>
            <Button
              title={serieEmEdicao ? "Salvar série" : "Adicionar série"}
              onPress={handleSubmit((dadosSerie) => salvarSerie(dadosSerie))}
            />
            {serieEmEdicao && (
              <Button
                title="Cancelar edição"
                variant="neutral"
                onPress={cancelarEdicao}
              />
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: 12,
  },
  vazio: { color: cores.textoSecundario, fontSize: 14, marginBottom: 4 },
  linhaSerie: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  textoSerie: { fontSize: 15, fontWeight: "bold", color: cores.texto },
  textoRepeticoes: { flex: 1, fontSize: 15, color: cores.ciano },
  formulario: { marginTop: 14 },
  botoes: { gap: 10 },
});
