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
  // Textos do campo de nome, para o mesmo formulário servir a treino e subtreino.
  rotuloNome?: string;
  placeholderNome?: string;
  placeholderDescricao?: string;
}

// Formulário compartilhado entre criar/editar treino e criar/editar subtreino.
export const TrainingForm = ({
  titulo,
  subtitulo,
  control,
  salvando,
  aoSalvar,
  rotuloNome = "Nome do treino",
  placeholderNome = "Ex.: Treino A",
  placeholderDescricao = "Ex.: Treino de perna",
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
        label={rotuloNome}
        placeholder={placeholderNome}
        required="O nome é obrigatório"
        maxLength={70}
      />
      <Input
        name="descricao"
        control={control}
        label="Descrição"
        placeholder={placeholderDescricao}
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
