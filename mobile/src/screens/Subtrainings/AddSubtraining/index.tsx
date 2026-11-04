import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { TrainingForm } from "../../Trainings/components/TrainingForm";
import { criarSubtreino } from "../api";
import { DadosSubtreino } from "../types/subtreinosTypes";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const AddSubtraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId } =
    useRoute<RouteProp<TScreenDefinition, "AddSubtraining">>().params;
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<DadosSubtreino>({
    defaultValues: { titulo: "", descricao: "" },
  });

  const { mutate: salvarSubtreino, isPending } = useMutation({
    mutationFn: (dadosSubtreino: DadosSubtreino) =>
      criarSubtreino(treinoId, dadosSubtreino),
    onSuccess: (subtreinoCriado) => {
      queryClient.invalidateQueries({ queryKey: ["subtreinos", treinoId] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Subtreino criado com sucesso!",
      });
      navigation.replace("SubtrainingDetail", {
        treinoId,
        id: subtreinoCriado.id,
        titulo: subtreinoCriado.titulo,
      });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao salvar o subtreino"),
      });
    },
  });

  return (
    <TrainingForm
      titulo="Novo Subtreino"
      subtitulo="Divida o treino, por exemplo: Peito, Costas ou Pernas"
      rotuloNome="Nome do subtreino"
      placeholderNome="Ex.: Peito"
      placeholderDescricao="Ex.: Supinos e crucifixo"
      control={control}
      salvando={isPending}
      aoSalvar={handleSubmit((dadosSubtreino) => salvarSubtreino(dadosSubtreino))}
    />
  );
};
