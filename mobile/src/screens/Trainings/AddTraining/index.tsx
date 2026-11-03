import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { TrainingForm } from "../components/TrainingForm";
import { criarTreino } from "../api";
import { DadosTreino } from "../types/treinosTypes";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import type { TNavigationScreenProps } from "../../../Routes";

export const AddTraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<DadosTreino>({
    defaultValues: { titulo: "", descricao: "" },
  });

  const { mutate: salvarTreino, isPending } = useMutation({
    mutationFn: criarTreino,
    onSuccess: (treinoCriado) => {
      queryClient.invalidateQueries({ queryKey: ["treinos"] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Treino criado com sucesso!",
      });
      navigation.replace("TrainingDetail", {
        id: treinoCriado.id,
        titulo: treinoCriado.titulo,
      });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao salvar o treino"),
      });
    },
  });

  return (
    <TrainingForm
      titulo="Novo Treino"
      subtitulo="Dê um nome e descreva o foco do treino"
      control={control}
      salvando={isPending}
      aoSalvar={handleSubmit((dadosTreino) => salvarTreino(dadosTreino))}
    />
  );
};
