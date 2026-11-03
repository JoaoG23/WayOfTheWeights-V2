import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ConfirmarRemocao } from "../../../components/ConfirmarRemocao";
import { removerTreino } from "../api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { CHAVE_RESUMO_EVOLUCAO } from "../../Weights/api";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const RemoveTraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { id, titulo } =
    useRoute<RouteProp<TScreenDefinition, "RemoveTraining">>().params;
  const queryClient = useQueryClient();

  const { mutate: confirmarRemocao, isPending } = useMutation({
    mutationFn: () => removerTreino(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treinos"] });
      queryClient.invalidateQueries({ queryKey: CHAVE_RESUMO_EVOLUCAO });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Treino removido com sucesso!",
      });
      // Volta além do detalhe do treino, que não existe mais.
      navigation.pop(2);
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: obterMensagemErro(erro, "Erro ao remover o treino"),
      });
    },
  });

  return (
    <ConfirmarRemocao
      titulo="Remover Treino"
      mensagem={`Tem certeza que deseja remover o treino "${titulo}"? Todos os exercícios e o histórico de cargas dele também serão removidos.`}
      removendo={isPending}
      aoConfirmar={() => confirmarRemocao()}
      aoDesistir={() => navigation.goBack()}
    />
  );
};
