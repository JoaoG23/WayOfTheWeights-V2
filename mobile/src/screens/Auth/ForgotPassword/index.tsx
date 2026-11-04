import { Text, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import api from "../../../services/api";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { AuthLayout } from "../components/AuthLayout";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface DadosSolicitacao {
  email: string;
}

// Passo 1: pede o código de 6 dígitos por email. O backend responde igual
// exista o email ou não, então o texto avisa "se estiver cadastrado".
export const ForgotPassword = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { control, handleSubmit } = useForm<DadosSolicitacao>({
    defaultValues: { email: "" },
  });

  const { mutate: solicitarCodigo, isPending } = useMutation({
    mutationFn: (dadosSolicitacao: DadosSolicitacao) =>
      api.post("/auth/recuperar-senha", dadosSolicitacao),
    onSuccess: (_resposta, dadosSolicitacao) => {
      Toast.show({
        type: "success",
        text1: "Verifique seu email",
        text2: "Se o email estiver cadastrado, enviamos um código de 6 dígitos.",
      });
      navigation.navigate("ResetPassword", { email: dadosSolicitacao.email });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível enviar",
        text2: obterMensagemErro(erro, "Verifique sua conexão"),
      });
    },
  });

  return (
    <AuthLayout
      rodape={
        <Button
          title="Voltar ao login"
          variant="dark"
          onPress={() => navigation.goBack()}
        />
      }
    >
      <Text style={styles.explicacao}>
        Informe o email da sua conta. Enviaremos um código de 6 dígitos para
        você criar uma nova senha.
      </Text>
      <Input
        name="email"
        control={control}
        variant="underline"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        required="Informe seu email"
      />
      {isPending ? (
        <ActivityIndicator size="large" color={cores.textoEscuro} />
      ) : (
        <Button
          title="Enviar código"
          variant="dark"
          onPress={handleSubmit((dadosSolicitacao) =>
            solicitarCodigo(dadosSolicitacao)
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
});
