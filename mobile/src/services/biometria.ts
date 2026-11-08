import { Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

import type { DadosLogin } from "../contexts/AuthContext";

// As credenciais ficam no Keychain (iOS) / Keystore (Android), nunca em
// AsyncStorage. A biometria (ou o PIN/padrão do aparelho) libera o uso delas.
const CHAVE_CREDENCIAIS = "credenciais_login";

export const biometriaDisponivel = async (): Promise<boolean> => {
  const possuiHardware = await LocalAuthentication.hasHardwareAsync();
  if (!possuiHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
};

export const biometriaAtivada = async (): Promise<boolean> => {
  const credenciais = await SecureStore.getItemAsync(CHAVE_CREDENCIAIS);
  return credenciais !== null;
};

export const ativarBiometria = (dadosLogin: DadosLogin) =>
  SecureStore.setItemAsync(CHAVE_CREDENCIAIS, JSON.stringify(dadosLogin));

export const desativarBiometria = () =>
  SecureStore.deleteItemAsync(CHAVE_CREDENCIAIS);

// Pede digital, rosto ou, na falta deles, o PIN/padrão do aparelho. Devolve as
// credenciais salvas, ou null se o usuário cancelou/falhou.
export const obterCredenciaisComBiometria =
  async (): Promise<DadosLogin | null> => {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: "Entrar no Way Of The Weights",
      cancelLabel: "Usar email e senha",
    });
    if (!resultado.success) return null;

    const credenciais = await SecureStore.getItemAsync(CHAVE_CREDENCIAIS);
    return credenciais ? (JSON.parse(credenciais) as DadosLogin) : null;
  };

// Depois de um login com senha, oferece guardar as credenciais para os
// próximos acessos. Não pergunta de novo se já está ativado ou indisponível.
export const oferecerAtivarBiometria = async (dadosLogin: DadosLogin) => {
  if (!(await biometriaDisponivel())) return;
  if (await biometriaAtivada()) return;

  Alert.alert(
    "Entrar mais rápido",
    "Deseja usar a biometria ou o desbloqueio do celular nos próximos acessos, sem digitar email e senha?",
    [
      { text: "Agora não", style: "cancel" },
      { text: "Ativar", onPress: () => ativarBiometria(dadosLogin) },
    ]
  );
};
