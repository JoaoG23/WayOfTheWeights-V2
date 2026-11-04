import { Text, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import api from "../../../services/api";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { AuthLayout } from "../components/AuthLayout";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

interface DadosRedefinicao {
  codigo: string;
  novaSenha: string;
  confirmacaoSenha: string;
}

// Passo 2: código recebido por email + nova senha.
export const ResetPassword = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { email } =
    useRoute<RouteProp<TScreenDefinition, "ResetPassword">>().params;
  const { control, handleSubmit } = useForm<DadosRedefinicao>({
    defaultValues: { codigo: "", novaSenha: "", confirmacaoSenha: "" },
  });

  const { mutate: redefinirSenha, isPending } = useMutation({
    mutationFn: ({ codigo, novaSenha }: DadosRedefinicao) =>
      api.post("/auth/redefinir-senha", { email, codigo, novaSenha }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Senha alterada",
        text2: "Entre com a sua nova senha.",
      });
      // Volta ao login, descartando os passos da recuperação.
      navigation.popTo("Login");
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível redefinir",
        text2: obterMensagemErro(erro, "Verifique sua conexão"),
      });
    },
  });

  return (
    <AuthLayout
      rodape={
        <>
          <Text style={styles.textoRodape}>Não recebeu o código?</Text>
          <Button
            title="Pedir outro código"
            variant="dark"
            onPress={() => navigation.goBack()}
          />
        </>
      }
    >
      <Text style={styles.explicacao}>
        Digite o código de 6 dígitos enviado para {email}.
      </Text>
      <Input
        name="codigo"
        control={control}
        variant="underline"
        placeholder="Código de 6 dígitos"
        keyboardType="number-pad"
        maxLength={6}
        required="Informe o código"
        rules={{
          pattern: { value: /^\d{6}$/, message: "O código tem 6 dígitos" },
        }}
      />
      <Input
        name="novaSenha"
        control={control}
        variant="underline"
        placeholder="Nova senha (mínimo 6 caracteres)"
        secureTextEntry
        required="Informe a nova senha"
        rules={{
          minLength: { value: 6, message: "Mínimo de 6 caracteres" },
        }}
      />
      <Input
        name="confirmacaoSenha"
        control={control}
        variant="underline"
        placeholder="Confirme a nova senha"
        secureTextEntry
        required="Confirme a nova senha"
        rules={{
          validate: (confirmacaoSenha, valoresFormulario) =>
            confirmacaoSenha === valoresFormulario.novaSenha ||
            "As senhas não conferem",
        }}
      />
      {isPending ? (
        <ActivityIndicator size="large" color={cores.textoEscuro} />
      ) : (
        <Button
          title="Redefinir senha"
          variant="dark"
          onPress={handleSubmit((dadosRedefinicao) =>
            redefinirSenha(dadosRedefinicao)
          )}
        />
      )}
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  explicacao: {
    color: cores.textoEscuro,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  textoRodape: {
    textAlign: "center",
    color: cores.textoEscuro,
    fontSize: 14,
  },
});
