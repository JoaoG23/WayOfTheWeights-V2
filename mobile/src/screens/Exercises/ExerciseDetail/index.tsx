import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { GraficoEvolucao } from "../../../components/GraficoEvolucao";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import {
  atualizarCargaExercicio,
  buscarExercicio,
  listarHistoricoCargas,
} from "../api";
import { invalidarConsultasExercicios } from "../invalidarConsultasExercicios";
import {
  converterTextoEmCarga,
  formatarCarga,
  REGEX_CARGA,
} from "../../../helpers/formatarCarga/formatarCarga";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

interface DadosNovaCarga {
  carga: string;
}

export const ExerciseDetail = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, id } =
    useRoute<RouteProp<TScreenDefinition, "ExerciseDetail">>().params;
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<DadosNovaCarga>({
    defaultValues: { carga: "" },
  });

  const {
    data: exercicio,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exercicio", treinoId, id],
    queryFn: () => buscarExercicio(treinoId, id),
  });
  const { data: historico = [] } = useQuery({
    queryKey: ["historico", treinoId, id],
    queryFn: () => listarHistoricoCargas(treinoId, id),
  });

  const { mutate: registrarCarga, isPending } = useMutation({
    mutationFn: (dadosNovaCarga: DadosNovaCarga) =>
      atualizarCargaExercicio(
        treinoId,
        id,
        converterTextoEmCarga(dadosNovaCarga.carga)
      ),
    onSuccess: () => {
      invalidarConsultasExercicios(queryClient);
      reset({ carga: "" });
      Toast.show({
        type: "success",
        text1: "Carga registrada",
        text2: "Seu histórico de evolução foi atualizado!",
      });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao registrar a carga"),
      });
    },
  });

  if (isLoading) return <Carregando />;
  if (isError || !exercicio) {
    return <MensagemTela texto="Erro ao carregar o exercício." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>{exercicio.nome}</Text>

      <View style={styles.cartaoCarga}>
        <View>
          <Text style={styles.rotuloCarga}>Sua Carga Atual</Text>
          <Text style={styles.valorCarga}>
            {formatarCarga(exercicio.cargaAtual)}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="dumbbell"
          size={56}
          color={cores.textoEscuro}
        />
      </View>

      <Card>
        <Input
          name="carga"
          control={control}
          label="Nova carga (kg)"
          placeholder="Ex.: 42,5"
          keyboardType="decimal-pad"
          required="Informe a nova carga"
          rules={{
            pattern: { value: REGEX_CARGA, message: "Use um número, ex.: 42,5" },
          }}
        />
        {isPending ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <Button
            title="Registrar carga"
            onPress={handleSubmit((dadosNovaCarga) =>
              registrarCarga(dadosNovaCarga)
            )}
          />
        )}
      </Card>

      <Card>
        <Text style={styles.tituloHistorico}>Histórico de Evolução</Text>
        <GraficoEvolucao historico={historico} />
      </Card>

      <TouchableOpacity
        style={styles.botaoRemover}
        onPress={() =>
          navigation.navigate("RemoveExercise", {
            treinoId,
            id,
            nome: exercicio.nome,
          })
        }
      >
        <Text style={styles.textoRemover}>Remover exercício</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: cores.texto,
    marginVertical: 12,
  },
  cartaoCarga: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: cores.ciano,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  rotuloCarga: { fontSize: 16, color: cores.textoEscuro, fontWeight: "600" },
  valorCarga: { fontSize: 34, color: cores.textoEscuro, fontWeight: "bold" },
  tituloHistorico: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: 12,
  },
  botaoRemover: { alignItems: "center", paddingVertical: 12 },
  textoRemover: { color: cores.perigo, fontSize: 15, fontWeight: "600" },
});
