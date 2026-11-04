import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { ConfirmarRemocao } from "../../../components/ConfirmarRemocao";
import { removerUsuario } from "../api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const RemoveUser = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { id, nome } = useRoute<RouteProp<TScreenDefinition, "RemoveUser">>().params;
  const queryClient = useQueryClient();

  const { mutate: confirmarRemocao, isPending } = useMutation({
    mutationFn: () => removerUsuario(id),
    onSuccess: () => {
      // Remover libera a vaga do perfil no plano.
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["plano"] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Usuário removido da conta!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: obterMensagemErro(erro, "Erro ao remover o usuário"),
      });
    },
  });

  return (
    <ConfirmarRemocao
      titulo="Remover Usuário"
      mensagem={`Tem certeza que deseja remover "${nome}"? Os treinos e o histórico de cargas dele também serão removidos.`}
      removendo={isPending}
      aoConfirmar={() => confirmarRemocao()}
      aoDesistir={() => navigation.goBack()}
    />
  );
};
