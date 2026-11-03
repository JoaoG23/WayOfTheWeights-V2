import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { TrainingForm } from "../components/TrainingForm";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { atualizarTreino, buscarTreino } from "../api";
import { DadosTreino } from "../types/treinosTypes";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { CHAVE_RESUMO_EVOLUCAO } from "../../Weights/api";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const EditTraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { id } = useRoute<RouteProp<TScreenDefinition, "EditTraining">>().params;
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<DadosTreino>({
    defaultValues: { titulo: "", descricao: "" },
  });

  const { data: treino, isLoading, isError } = useQuery({
    queryKey: ["treino", id],
    queryFn: () => buscarTreino(id),
  });

  useEffect(() => {
    if (treino) {
      reset({ titulo: treino.titulo, descricao: treino.descricao ?? "" });
    }
  }, [treino, reset]);

  const { mutate: salvarTreino, isPending } = useMutation({
    mutationFn: (dadosTreino: DadosTreino) => atualizarTreino(id, dadosTreino),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treinos"] });
      queryClient.invalidateQueries({ queryKey: ["treino", id] });
      queryClient.invalidateQueries({ queryKey: CHAVE_RESUMO_EVOLUCAO });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Treino atualizado!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao atualizar o treino"),
      });
    },
  });

  if (isLoading) return <Carregando />;
  if (isError) return <MensagemTela texto="Erro ao carregar o treino." />;

  return (
    <TrainingForm
      titulo="Editar Treino"
      subtitulo={treino?.titulo ?? ""}
      control={control}
      salvando={isPending}
      aoSalvar={handleSubmit((dadosTreino) => salvarTreino(dadosTreino))}
    />
  );
};
