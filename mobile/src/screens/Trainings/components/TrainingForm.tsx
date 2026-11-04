import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Control } from "react-hook-form";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { DadosTreino } from "../types/treinosTypes";
import { cores } from "../../../theme/cores";

interface TrainingFormProps {
  titulo: string;
  subtitulo: string;
  control: Control<DadosTreino>;
  salvando: boolean;
  aoSalvar: () => void;
}

// Formulário compartilhado entre criar e editar treino.
export const TrainingForm = ({
  titulo,
  subtitulo,
  control,
  salvando,
  aoSalvar,
}: TrainingFormProps) => (
  <View style={styles.container}>
    <DecoracaoFundo />
    <ScrollView
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Title title={titulo} />
      <Subtitle title={subtitulo} />
      <Input
        name="titulo"
        control={control}
        label="Nome do treino"
        placeholder="Ex.: Treino A"
        required="O nome do treino é obrigatório"
        maxLength={70}
      />
      <Input
        name="descricao"
        control={control}
        label="Descrição"
        placeholder="Ex.: Treino de perna"
      />
      {salvando ? (
        <ActivityIndicator size="large" color={cores.destaque} />
      ) : (
        <Button title="Salvar" onPress={aoSalvar} />
      )}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
});
