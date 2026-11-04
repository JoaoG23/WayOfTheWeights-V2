import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { TrainingForm } from "../../Trainings/components/TrainingForm";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { atualizarSubtreino, buscarSubtreino } from "../api";
import { DadosSubtreino } from "../types/subtreinosTypes";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const EditSubtraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, id } =
    useRoute<RouteProp<TScreenDefinition, "EditSubtraining">>().params;
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<DadosSubtreino>({
    defaultValues: { titulo: "", descricao: "" },
  });

  const { data: subtreino, isLoading, isError } = useQuery({
    queryKey: ["subtreino", treinoId, id],
    queryFn: () => buscarSubtreino(treinoId, id),
  });

  useEffect(() => {
    if (subtreino) {
      reset({ titulo: subtreino.titulo, descricao: subtreino.descricao ?? "" });
    }
  }, [subtreino, reset]);

  const { mutate: salvarSubtreino, isPending } = useMutation({
    mutationFn: (dadosSubtreino: DadosSubtreino) =>
      atualizarSubtreino(treinoId, id, dadosSubtreino),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtreinos", treinoId] });
      queryClient.invalidateQueries({ queryKey: ["subtreino", treinoId, id] });
      // O resumo de evolução mostra o nome do subtreino.
      queryClient.invalidateQueries({ queryKey: ["estatisticas-resumo"] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Subtreino atualizado!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao atualizar o subtreino"),
      });
    },
  });

  if (isLoading) return <Carregando />;
  if (isError) return <MensagemTela texto="Erro ao carregar o subtreino." />;

  return (
    <TrainingForm
      titulo="Editar Subtreino"
      subtitulo={subtreino?.titulo ?? ""}
      rotuloNome="Nome do subtreino"
      placeholderNome="Ex.: Peito"
      placeholderDescricao="Ex.: Supinos e crucifixo"
      control={control}
      salvando={isPending}
      aoSalvar={handleSubmit((dadosSubtreino) => salvarSubtreino(dadosSubtreino))}
    />
  );
};
