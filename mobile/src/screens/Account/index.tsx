import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Carregando, MensagemTela } from "../../components/Feedback";
import { PerfilUsuario, useAuth } from "../../contexts/AuthContext";
import { buscarMinhaConta, buscarPlanoConta } from "./api";
import { cores } from "../../theme/cores";

const NOMES_PERFIS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: "Administradores",
  TREINADOR: "Treinadores",
  ALUNO: "Alunos",
};

const NOMES_PLANOS = { BASICO: "Básico", BETA: "Beta" };

export const Account = () => {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
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
          {(Object.keys(NOMES_PERFIS) as PerfilUsuario[]).map((perfil) => (
            <View key={perfil} style={styles.linhaPlano}>
              <Text style={styles.textoLinhaPlano}>{NOMES_PERFIS[perfil]}</Text>
              <Text style={styles.valorLinhaPlano}>
                {plano.usuariosPorPerfil[perfil]} / {plano.limites[perfil]}
              </Text>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.botaoSair}>
        <Button title="Sair da conta" variant="danger" onPress={sair} />
      </View>
    </ScrollView>
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
  botaoSair: { marginTop: 16 },
});
