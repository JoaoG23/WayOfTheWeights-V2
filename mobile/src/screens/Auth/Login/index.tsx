import { useCallback, useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { AuthLayout } from "../components/AuthLayout";
import { DadosLogin, useAuth } from "../../../contexts/AuthContext";
import {
  biometriaAtivada,
  biometriaDisponivel,
  desativarBiometria,
  obterCredenciaisComBiometria,
  oferecerAtivarBiometria,
} from "../../../services/biometria";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

export const Login = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { entrar } = useAuth();
  const { control, handleSubmit } = useForm<DadosLogin>({
    defaultValues: { email: "", senha: "" },
  });

  // Ao entrar, o AuthContext guarda o usuário e as rotas trocam sozinhas
  // para o app logado.
  const { mutate: fazerLogin, isPending } = useMutation({
    mutationFn: async (dadosLogin: DadosLogin) => {
      await entrar(dadosLogin);
      // Já logado: oferece guardar as credenciais para os próximos acessos.
      oferecerAtivarBiometria(dadosLogin);
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível entrar",
        text2: obterMensagemErro(erro, "Verifique sua conexão"),
      });
    },
  });

  const [biometriaPronta, setBiometriaPronta] = useState(false);

  const entrarComBiometria = useCallback(async () => {
    const credenciais = await obterCredenciaisComBiometria();
    if (!credenciais) return;
    try {
      await entrar(credenciais);
    } catch (erro) {
      // Senha trocada ou conta alterada: as credenciais guardadas não servem mais.
      await desativarBiometria();
      setBiometriaPronta(false);
      Toast.show({
        type: "error",
        text1: "Biometria desativada",
        text2: obterMensagemErro(erro, "Entre com email e senha novamente"),
      });
    }
  }, [entrar]);

  // Se a biometria está ativa, já pede a digital/rosto ao abrir a tela.
  useEffect(() => {
    const prepararBiometria = async () => {
      const pronta = (await biometriaDisponivel()) && (await biometriaAtivada());
      setBiometriaPronta(pronta);
      if (pronta) entrarComBiometria();
    };
    prepararBiometria();
  }, [entrarComBiometria]);

  return (
    <AuthLayout
      rodape={
        <>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.link}>Esqueci minha senha</Text>
          </TouchableOpacity>
          <Text style={styles.textoRodape}>Caso você não tenha conta</Text>
          <Button
            title="Registre-se"
            variant="dark"
            onPress={() => navigation.navigate("SignUp")}
          />
        </>
      }
    >
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
        placeholder="Senha"
        secureTextEntry
        required="Informe sua senha"
      />

      {biometriaPronta && !isPending && (
        <TouchableOpacity style={styles.botaoBiometria} onPress={entrarComBiometria}>
          <Ionicons name="finger-print" size={28} color={cores.textoEscuro} />
          <Text style={styles.link}>Entrar com biometria</Text>
        </TouchableOpacity>
      )}

      {isPending ? (
        <ActivityIndicator size="large" color={cores.textoEscuro} />
      ) : (
        <Button
          title="Entrar"
          variant="dark"
          onPress={handleSubmit((dadosLogin) => fazerLogin(dadosLogin))}
        />
      )}
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  botaoBiometria: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  link: {
    textAlign: "center",
    color: cores.textoEscuro,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  textoRodape: {
    textAlign: "center",
    color: cores.textoEscuro,
    fontSize: 14,
  },
});
