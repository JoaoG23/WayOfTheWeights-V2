import { useState } from "react";
import { ScrollView, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { TelaComTeclado } from "../../../components/TelaComTeclado";
import { SeletorImagens } from "./components/SeletorImagens";
import { RevisaoImportacao } from "./components/RevisaoImportacao";
import { FormularioImportacao, paraDadosDaApi, paraFormulario } from "./importacao";
import { importarSubtreino, lerImagensDoSubtreino } from "../api";
import { ImagemSelecionada } from "../types/subtreinosTypes";
import { invalidarConsultasExercicios } from "../../Exercises/invalidarConsultasExercicios";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

// Id que nunca existe: faz o backend criar um subtreino novo (upsert).
const ID_SUBTREINO_NOVO = 0;

// Importa um subtreino a partir de imagens da ficha de treino:
// 1) escolhe as imagens e o Gemini lê; 2) o usuário confere; 3) salva.
// Com `subtreinoId`, atualiza esse subtreino; sem ele, cria um novo.
export const ImportSubtraining = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId, subtreinoId } =
    useRoute<RouteProp<TScreenDefinition, "ImportSubtraining">>().params;
  const queryClient = useQueryClient();
  const [imagens, setImagens] = useState<ImagemSelecionada[]>([]);
  const [leituraConcluida, setLeituraConcluida] = useState(false);
  const { control, handleSubmit, reset } = useForm<FormularioImportacao>({
    defaultValues: { titulo: "", descricao: "", exercicios: [] },
  });

  const { mutate: lerImagens, isPending: lendo } = useMutation({
    mutationFn: () => lerImagensDoSubtreino(treinoId, imagens),
    onSuccess: (leitura) => {
      reset(paraFormulario(leitura));
      setLeituraConcluida(true);
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível ler as imagens",
        text2: obterMensagemErro(erro, "Tente novamente"),
      });
    },
  });

  const { mutate: salvar, isPending: salvando } = useMutation({
    mutationFn: (formulario: FormularioImportacao) =>
      importarSubtreino(
        treinoId,
        subtreinoId ?? ID_SUBTREINO_NOVO,
        paraDadosDaApi(formulario)
      ),
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ["subtreinos", treinoId] });
      queryClient.invalidateQueries({ queryKey: ["subtreino", treinoId] });
      queryClient.invalidateQueries({ queryKey: ["series"] });
      invalidarConsultasExercicios(queryClient);
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: resultado.criado
          ? "Subtreino importado!"
          : "Subtreino atualizado!",
      });
      if (!resultado.criado) {
        navigation.goBack();
        return;
      }
      navigation.replace("SubtrainingDetail", {
        treinoId,
        id: resultado.id,
        titulo: resultado.titulo,
      });
    },
    onError: (erro) => {
      console.log(erro);
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao importar o subtreino"),
      });
    },
  });

  const atualizando = subtreinoId !== undefined;

  return (
    <TelaComTeclado>
      <DecoracaoFundo />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Title title={atualizando ? "Atualizar por imagens" : "Importar por imagens"} />
        <Subtitle
          title={
            atualizando
              ? "Envie a ficha de treino: os exercícios do subtreino serão atualizados"
              : "Envie fotos da ficha de treino e o app monta o subtreino para você"
          }
        />

        {leituraConcluida ? (
          <RevisaoImportacao
            control={control}
            salvando={salvando}
            aoSalvar={handleSubmit((formulario) => salvar(formulario))}
            aoLerNovamente={() => setLeituraConcluida(false)}
          />
        ) : (
          <>
            <SeletorImagens imagens={imagens} aoAlterar={setImagens} />
            {lendo ? (
              <>
                <ActivityIndicator size="large" color={cores.destaque} />
                <Text style={styles.aviso}>Lendo as imagens, pode levar alguns segundos...</Text>
              </>
            ) : (
              imagens.length > 0 && (
                <Button title="Ler imagens" onPress={() => lerImagens()} />
              )
            )}
          </>
        )}
      </ScrollView>
    </TelaComTeclado>
  );
};

const styles = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 48 },
  aviso: {
    textAlign: "center",
    color: cores.textoSecundario,
    marginTop: 12,
    fontSize: 14,
  },
});
