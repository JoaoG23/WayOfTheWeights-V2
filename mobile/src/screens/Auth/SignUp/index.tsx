import { Text, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import api from "../../../services/api";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export const SignUp = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { entrar } = useAuth();
  const { control, handleSubmit } = useForm<DadosCadastro>({
    defaultValues: { nome: "", email: "", senha: "" },
  });

  // POST /conta cria a conta (plano BASICO) com você como administrador; em
  // seguida já entra no app com o mesmo email e senha.
  const { mutate: cadastrar, isPending } = useMutation({
    mutationFn: async (dadosCadastro: DadosCadastro) => {
      await api.post("/conta", dadosCadastro);
      await entrar({ email: dadosCadastro.email, senha: dadosCadastro.senha });
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Conta criada",
        text2: "Bem-vindo ao Way Of The Weights!",
      });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível cadastrar",
        text2: obterMensagemErro(erro, "Verifique sua conexão"),
      });
    },
  });

  return (
    <AuthLayout
      rodape={
        <>
          <Text style={styles.textoRodape}>Já tem uma conta?</Text>
          <Button
            title="Entrar"
            variant="dark"
            onPress={() => navigation.goBack()}
          />
        </>
      }
    >
      <Input
        name="nome"
        control={control}
        variant="underline"
        placeholder="Nome"
        required="Informe seu nome"
      />
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
      <Input
        name="senha"
        control={control}
        variant="underline"
        placeholder="Senha (mínimo 6 caracteres)"
        secureTextEntry
        required="Informe uma senha"
        rules={{
          minLength: { value: 6, message: "Mínimo de 6 caracteres" },
        }}
      />

      {isPending ? (
        <ActivityIndicator size="large" color={cores.textoEscuro} />
      ) : (
        <Button
          title="Criar conta"
          variant="dark"
          onPress={handleSubmit((dadosCadastro) => cadastrar(dadosCadastro))}
        />
      )}
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  textoRodape: {
    textAlign: "center",
    color: cores.textoEscuro,
    fontSize: 14,
  },
});
