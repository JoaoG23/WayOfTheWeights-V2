import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ConfirmarRemocao } from "../../../components/ConfirmarRemocao";
import { removerSubtreino } from "../api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { CHAVE_RESUMO_EVOLUCAO } from "../../Weights/api";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const RemoveSubtraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, id, titulo } =
    useRoute<RouteProp<TScreenDefinition, "RemoveSubtraining">>().params;
  const queryClient = useQueryClient();

  const { mutate: confirmarRemocao, isPending } = useMutation({
    mutationFn: () => removerSubtreino(treinoId, id),
    onSuccess: () => {
      // Remover libera uma das 3 vagas do treino e leva os exercícios junto.
      queryClient.invalidateQueries({ queryKey: ["subtreinos", treinoId] });
      queryClient.invalidateQueries({ queryKey: CHAVE_RESUMO_EVOLUCAO });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Subtreino removido com sucesso!",
      });
      // Volta além do detalhe do subtreino, que não existe mais.
      navigation.pop(2);
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: obterMensagemErro(erro, "Erro ao remover o subtreino"),
      });
    },
  });

  return (
    <ConfirmarRemocao
      titulo="Remover Subtreino"
      mensagem={`Tem certeza que deseja remover o subtreino "${titulo}"? Todos os exercícios, séries e o histórico de cargas dele também serão removidos.`}
      removendo={isPending}
      aoConfirmar={() => confirmarRemocao()}
      aoDesistir={() => navigation.goBack()}
    />
  );
};
