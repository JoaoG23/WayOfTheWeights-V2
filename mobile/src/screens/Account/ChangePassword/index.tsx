import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { trocarSenha } from "../api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface DadosFormularioSenha {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoSenha: string;
}

export const ChangePassword = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { control, handleSubmit } = useForm<DadosFormularioSenha>({
    defaultValues: { senhaAtual: "", novaSenha: "", confirmacaoSenha: "" },
  });

  const { mutate: salvarSenha, isPending } = useMutation({
    mutationFn: ({ senhaAtual, novaSenha }: DadosFormularioSenha) =>
      trocarSenha({ senhaAtual, novaSenha }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Senha alterada",
        text2: "Use a nova senha no próximo login.",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível trocar a senha",
        text2: obterMensagemErro(erro, "Verifique sua conexão"),
      });
    },
  });

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Title title="Trocar Senha" />
        <Subtitle title="Por segurança, confirme sua senha atual" />
        <Input
          name="senhaAtual"
          control={control}
          label="Senha atual"
          icon="lock-closed-outline"
          secureTextEntry
          required="Informe sua senha atual"
        />
        <Input
          name="novaSenha"
          control={control}
          label="Nova senha"
          icon="key-outline"
          secureTextEntry
          required="Informe a nova senha"
          rules={{
            minLength: { value: 6, message: "Mínimo de 6 caracteres" },
          }}
        />
        <Input
          name="confirmacaoSenha"
          control={control}
          label="Confirme a nova senha"
          icon="key-outline"
          secureTextEntry
          required="Confirme a nova senha"
          rules={{
            validate: (confirmacaoSenha, valoresFormulario) =>
              confirmacaoSenha === valoresFormulario.novaSenha ||
              "As senhas não conferem",
          }}
        />
        {isPending ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <Button
            title="Salvar nova senha"
            onPress={handleSubmit((dadosSenha) => salvarSenha(dadosSenha))}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
});
