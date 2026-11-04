import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Carregando, MensagemTela } from "../../components/Feedback";
import { DecoracaoFundo } from "../../components/DecoracaoFundo";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { NOME_PERFIL_PLURAL, PERFIS } from "../../helpers/perfis/perfis";
import { buscarMinhaConta, buscarPlanoConta } from "./api";
import { cores } from "../../theme/cores";
import type { TNavigationScreenProps } from "../../Routes";

const NOMES_PLANOS = { BASICO: "Básico", BETA: "Beta" };

export const Account = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { sair } = useAuth();

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
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color={cores.textoEscuro} />
          </View>
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
          {conta.perfil === "ADMINISTRADOR" && (
            <Button
              title="Usuários da conta"
              onPress={() => navigation.navigate("Users")}
            />
          )}
          <Button
            title="Trocar senha"
            variant="neutral"
            onPress={() => navigation.navigate("ChangePassword")}
          />
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
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
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
