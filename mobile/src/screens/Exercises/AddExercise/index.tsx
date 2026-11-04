import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { criarExercicio } from "../api";
import { DadosNovoExercicio } from "../types/exerciciosTypes";
import { invalidarConsultasExercicios } from "../invalidarConsultasExercicios";
import {
  converterTextoEmCarga,
  REGRAS_CARGA,
} from "../../../helpers/formatarCarga/formatarCarga";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps, TScreenDefinition } from "../../../Routes";

export const AddExercise = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const { treinoId } =
    useRoute<RouteProp<TScreenDefinition, "AddExercise">>().params;
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<DadosNovoExercicio>({
    defaultValues: { nome: "", carga: "" },
  });

  const { mutate: salvarExercicio, isPending } = useMutation({
    mutationFn: (dadosExercicio: DadosNovoExercicio) =>
      criarExercicio(treinoId, {
        nome: dadosExercicio.nome,
        cargaAtual: converterTextoEmCarga(dadosExercicio.carga),
      }),
    onSuccess: () => {
      invalidarConsultasExercicios(queryClient);
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Exercício adicionado!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Houve um erro",
        text2: obterMensagemErro(erro, "Erro ao salvar o exercício"),
      });
    },
  });

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Title title="Novo Exercício" />
        <Subtitle title="A carga inicial é o primeiro ponto do seu histórico de evolução" />
        <Input
          name="nome"
          control={control}
          label="Nome do exercício"
          placeholder="Ex.: Leg Press 45 graus"
          required="O nome do exercício é obrigatório"
          maxLength={70}
        />
        <Input
          name="carga"
          control={control}
          label="Carga inicial (kg)"
          placeholder="Ex.: 40"
          keyboardType="number-pad"
          required="Informe a carga inicial"
          rules={REGRAS_CARGA}
        />
        {isPending ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <Button
            title="Salvar"
            onPress={handleSubmit((dadosExercicio) =>
              salvarExercicio(dadosExercicio)
            )}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
});
