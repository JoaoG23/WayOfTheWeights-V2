import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ConfirmarRemocao } from "../../../components/ConfirmarRemocao";
import { removerExercicio } from "../api";
import { invalidarConsultasExercicios } from "../invalidarConsultasExercicios";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const RemoveExercise = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, id, nome } =
    useRoute<RouteProp<TScreenDefinition, "RemoveExercise">>().params;
  const queryClient = useQueryClient();

  const { mutate: confirmarRemocao, isPending } = useMutation({
    mutationFn: () => removerExercicio(treinoId, id),
    onSuccess: () => {
      invalidarConsultasExercicios(queryClient);
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Exercício removido com sucesso!",
      });
      // Volta além do detalhe do exercício, que não existe mais.
      navigation.pop(2);
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: obterMensagemErro(erro, "Erro ao remover o exercício"),
      });
    },
  });

  return (
    <ConfirmarRemocao
      titulo="Remover Exercício"
      mensagem={`Tem certeza que deseja remover "${nome}"? O histórico de cargas dele também será removido.`}
      removendo={isPending}
      aoConfirmar={() => confirmarRemocao()}
      aoDesistir={() => navigation.goBack()}
    />
  );
};
