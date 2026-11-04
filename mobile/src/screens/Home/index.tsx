import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { Card } from "../../components/Card";
import { Carregando } from "../../components/Feedback";
import { DecoracaoFundo } from "../../components/DecoracaoFundo";
import { useAuth } from "../../contexts/AuthContext";
import { formatarCarga } from "../../helpers/formatarCarga/formatarCarga";
import { listarTreinos } from "../Trainings/api";
import {
  buscarResumoEvolucao,
  CHAVE_RESUMO_EVOLUCAO,
  ResumoEvolucaoExercicio,
} from "../Weights/api";
import { cores } from "../../theme/cores";
import type { TNavigationScreenProps } from "../../Routes";

const obterMaiorEvolucao = (resumo: ResumoEvolucaoExercicio[]) =>
  resumo.reduce<ResumoEvolucaoExercicio | undefined>(
    (maiorEvolucao, exercicio) =>
      !maiorEvolucao || exercicio.evolucaoCarga > maiorEvolucao.evolucaoCarga
        ? exercicio
        : maiorEvolucao,
    undefined
  );

export const Home = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { usuario } = useAuth();

  const { data: resumo = [], isLoading: carregandoResumo } = useQuery({
    queryKey: CHAVE_RESUMO_EVOLUCAO,
    queryFn: buscarResumoEvolucao,
  });
  const { data: treinos = [], isLoading: carregandoTreinos } = useQuery({
    queryKey: ["treinos"],
    queryFn: listarTreinos,
  });

  if (carregandoResumo || carregandoTreinos) return <Carregando />;

  const maiorEvolucao = obterMaiorEvolucao(resumo);
  const ultimoTreino = treinos[treinos.length - 1];
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.saudacoes}>
          <Text style={styles.saudacao}>Olá, {primeiroNome}</Text>
          <Text style={styles.saudacao}>Veja se ficou mais forte</Text>
        </View>

        {!maiorEvolucao ? (
          <Card
            onPress={() => navigation.navigate("Main", { screen: "Treinos" })}
          >
            <Text style={styles.tituloCartao}>Comece sua evolução</Text>
            <Text style={styles.subtituloCartao}>
              Cadastre um treino e seus exercícios para acompanhar suas cargas.
            </Text>
          </Card>
        ) : (
          <>
            <Card
              style={styles.cartaoLinha}
              onPress={() =>
                navigation.navigate("ExerciseDetail", {
                  treinoId: maiorEvolucao.treinoId,
                  subtreinoId: maiorEvolucao.subtreinoId,
                  id: maiorEvolucao.exercicioId,
                })
              }
            >
              <View style={styles.textosCartao}>
                <Text style={styles.tituloCartao}>Exercício de maior evolução</Text>
                <Text style={styles.subtituloCartao}>
                  {maiorEvolucao.nomeExercicio}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="dumbbell"
                size={40}
                color={cores.ciano}
              />
            </Card>

            <Card style={styles.cartaoLinha}>
              <View style={styles.textosCartao}>
                <Text style={styles.tituloCartao}>Aumento de Peso</Text>
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={40}
                  color={cores.destaque}
                />
              </View>
              <View style={styles.colunaCargas}>
                <Text style={styles.cargaAtual}>
                  Foi {formatarCarga(maiorEvolucao.cargaAtual)}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-double-up"
                  size={26}
                  color={cores.ciano}
                />
                <Text style={styles.cargaAnterior}>
                  Foi {formatarCarga(maiorEvolucao.cargaInicial)}
                </Text>
              </View>
            </Card>
          </>
        )}

        {ultimoTreino && (
          <Card
            style={styles.cartaoLinha}
            onPress={() =>
              navigation.navigate("TrainingDetail", {
                id: ultimoTreino.id,
                titulo: ultimoTreino.titulo,
              })
            }
          >
            <View style={styles.textosCartao}>
              <Text style={styles.tituloCartao}>Último treino</Text>
              <Text style={styles.subtituloCartao}>{ultimoTreino.titulo}</Text>
            </View>
            <MaterialCommunityIcons
              name="weight-lifter"
              size={40}
              color={cores.texto}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, paddingBottom: 32 },
  saudacoes: { marginBottom: 24, paddingRight: 90 },
  saudacao: {
    fontSize: 24,
    fontWeight: "bold",
    color: cores.texto,
  },
  cartaoLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textosCartao: { flex: 1, gap: 6 },
  tituloCartao: { fontSize: 18, fontWeight: "bold", color: cores.texto },
  subtituloCartao: { fontSize: 14, color: cores.textoSecundario },
  colunaCargas: { alignItems: "flex-end" },
  cargaAtual: { fontSize: 20, fontWeight: "bold", color: cores.texto },
  cargaAnterior: { fontSize: 14, color: cores.textoSecundario },
});
