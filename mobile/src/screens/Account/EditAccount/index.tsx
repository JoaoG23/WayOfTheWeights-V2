import { useEffect } from "react";
import { ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { TelaComTeclado } from "../../../components/TelaComTeclado";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { useAuth } from "../../../contexts/AuthContext";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { atualizarMinhaConta, buscarMinhaConta, DadosMinhaConta } from "../api";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

// Edição dos dados do usuário logado (por enquanto, o nome).
export const EditAccount = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const queryClient = useQueryClient();
  const { atualizarUsuario } = useAuth();
  const { control, handleSubmit, reset } = useForm<DadosMinhaConta>({
    defaultValues: { nome: "" },
  });

  const { data: conta, isLoading, isError } = useQuery({
    queryKey: ["conta"],
    queryFn: buscarMinhaConta,
  });

  useEffect(() => {
    if (conta) reset({ nome: conta.nome });
  }, [conta, reset]);

  const { mutate: salvarConta, isPending } = useMutation({
    mutationFn: atualizarMinhaConta,
    onSuccess: (contaAtualizada) => {
      // A saudação da Home usa o nome guardado na sessão.
      atualizarUsuario({ nome: contaAtualizada.nome });
      queryClient.invalidateQueries({ queryKey: ["conta"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Nome atualizado!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao atualizar o nome"),
      });
    },
  });

  if (isLoading) return <Carregando />;
  if (isError) return <MensagemTela texto="Erro ao carregar seus dados." />;

  return (
    <TelaComTeclado>
      <DecoracaoFundo />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Title title="Editar nome" />
        <Subtitle title="Esse é o nome exibido no app para você" />
        <Input
          name="nome"
          control={control}
          label="Seu nome"
          placeholder="Ex.: João Silva"
          required="O nome é obrigatório"
          maxLength={70}
          autoCapitalize="words"
        />
        {isPending ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <Button
            title="Salvar"
            onPress={handleSubmit((dadosConta) =>
              salvarConta({ nome: dadosConta.nome.trim() })
            )}
          />
        )}
      </ScrollView>
    </TelaComTeclado>
  );
};

const styles = StyleSheet.create({
  conteudo: { padding: 16 },
});
