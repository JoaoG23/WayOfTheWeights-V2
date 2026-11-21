import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/Card";
import { AvatarEditavel } from "./components/AvatarEditavel";
import { Button } from "../../components/Button";
import { Carregando, MensagemTela } from "../../components/Feedback";
import { DecoracaoFundo } from "../../components/DecoracaoFundo";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { NOME_PERFIL_PLURAL, PERFIS } from "../../helpers/perfis/perfis";
import { buscarMinhaConta, buscarPlanoConta } from "./api";
import { biometriaAtivada, desativarBiometria } from "../../services/biometria";
import { cores } from "../../theme/cores";
import type { TNavigationScreenProps } from "../../Routes";

const NOMES_PLANOS = { BASICO: "Básico", BETA: "Beta" };

export const Account = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { sair } = useAuth();
  const [biometriaLigada, setBiometriaLigada] = useState(false);

  useEffect(() => {
    biometriaAtivada().then(setBiometriaLigada);
  }, []);

  const desligarBiometria = async () => {
    await desativarBiometria();
    setBiometriaLigada(false);
  };

  const {
    data: conta,
    isLoading: carregandoConta,
    isError,
  } = useQuery({ queryKey: ["conta"], queryFn: buscarMinhaConta });
  const { data: plano, isLoading: carregandoPlano } = useQuery({
    queryKey: ["plano"],
    queryFn: buscarPlanoConta,
  });

  if (carregandoConta || carregandoPlano) return <Carregando />;
  if (isError || !conta) {
    return <MensagemTela texto="Erro ao carregar sua conta." />;
  }

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.perfil}>
          <AvatarEditavel fotoVersao={conta.fotoVersao} />
          <Text style={styles.nome}>{conta.nome}</Text>
          <Text style={styles.email}>{conta.email}</Text>
          <View style={styles.chipPerfil}>
            <Text style={styles.textoChipPerfil}>
              {conta.perfil}
              {conta.proprietario ? " • PROPRIETÁRIO" : ""}
            </Text>
          </View>
        </View>

        {plano && (
          <Card>
            <Text style={styles.tituloPlano}>
              Plano {NOMES_PLANOS[plano.plano]}
            </Text>
            {PERFIS.map((perfil) => (
              <View key={perfil} style={styles.linhaPlano}>
                <Text style={styles.textoLinhaPlano}>{NOME_PERFIL_PLURAL[perfil]}</Text>
                <Text style={styles.valorLinhaPlano}>
                  {plano.usuariosPorPerfil[perfil]} / {plano.limites[perfil]}
                </Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.botoes}>
          <Button
            title="Editar nome"
            variant="neutral"
            onPress={() => navigation.navigate("EditAccount")}
          />
          {conta.perfil === "ADMINISTRADOR" && (
            <Button
              title="Usuários da conta"
              onPress={() => navigation.navigate("Users")}
            />
          )}
          {biometriaLigada && (
            <Button
              title="Desativar login por biometria"
              variant="neutral"
              onPress={desligarBiometria}
            />
          )}
          <Button title="Sair da conta" variant="danger" onPress={sair} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  perfil: { alignItems: "center", marginVertical: 20, gap: 6 },
  nome: { fontSize: 22, fontWeight: "bold", color: cores.texto },
  email: { fontSize: 14, color: cores.textoSecundario },
  chipPerfil: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: cores.cartaoClaro,
  },
  textoChipPerfil: { fontSize: 12, fontWeight: "700", color: cores.texto },
  tituloPlano: {
    fontSize: 18,
    fontWeight: "bold",
    color: cores.destaque,
    marginBottom: 12,
  },
  linhaPlano: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  textoLinhaPlano: { fontSize: 15, color: cores.texto },
  valorLinhaPlano: { fontSize: 15, fontWeight: "bold", color: cores.texto },
  botoes: { marginTop: 16, gap: 10 },
});
