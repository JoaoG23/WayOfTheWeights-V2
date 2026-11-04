import { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../../components/Card";
import { ButtonFloating } from "../../../components/ButtonFloating";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { useAuth } from "../../../contexts/AuthContext";
import { NOME_PERFIL } from "../../../helpers/perfis/perfis";
import { listarUsuariosDaConta } from "../api";
import { buscarPlanoConta, obterPerfisComVaga } from "../../Account/api";
import { UsuarioConta } from "../types/usuariosTypes";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

// Usuários da conta (somente administrador). Cadastro limitado pelas vagas
// do plano; o proprietário e o próprio usuário não podem ser removidos.
export const Users = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { usuario } = useAuth();

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuariosDaConta,
  });
  const { data: plano } = useQuery({
    queryKey: ["plano"],
    queryFn: buscarPlanoConta,
  });

  const planoTemVaga = !!plano && obterPerfisComVaga(plano).length > 0;

  const renderItem = useCallback(
    ({ item }: { item: UsuarioConta }) => {
      const podeRemover = !item.proprietario && item.id !== usuario?.id;
      return (
        <Card style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.perfil}>
              {NOME_PERFIL[item.perfil]}
              {item.proprietario ? " • Proprietário" : ""}
              {!item.ativo ? " • Inativo" : ""}
            </Text>
          </View>
          {podeRemover && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RemoveUser", { id: item.id, nome: item.nome })
              }
            >
              <Feather name="trash" size={22} color={cores.perigo} />
            </TouchableOpacity>
          )}
        </Card>
      );
    },
    [navigation, usuario?.id]
  );
  const keyExtractor = useCallback((item: UsuarioConta) => item.id.toString(), []);

  const renderizarConteudo = () => {
    if (isLoading) return <Carregando />;
    if (isError) return <MensagemTela texto="Erro ao carregar os usuários." />;
    return (
      <FlatList
        data={usuarios}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <Text style={styles.titulo}>Usuários da Conta</Text>
      {plano && !planoTemVaga && (
        <Text style={styles.avisoPlano}>
          Todas as vagas do plano estão ocupadas. Remova um usuário ou mude de
          plano para cadastrar outro.
        </Text>
      )}
      {renderizarConteudo()}
      {planoTemVaga && (
        <ButtonFloating onPress={() => navigation.navigate("AddUser")} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: cores.texto,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  avisoPlano: {
    color: cores.destaque,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, gap: 4 },
  nome: { fontSize: 17, fontWeight: "bold", color: cores.texto },
  email: { fontSize: 13, color: cores.textoSecundario },
  perfil: { fontSize: 13, color: cores.ciano, fontWeight: "600" },
});
