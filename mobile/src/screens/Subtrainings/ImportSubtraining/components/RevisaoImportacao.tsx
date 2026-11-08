import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Control, useFieldArray } from "react-hook-form";

import { Input } from "../../../../components/Input/Input";
import { Button } from "../../../../components/Button";
import { Card } from "../../../../components/Card";
import { REGRAS_CARGA } from "../../../../helpers/formatarCarga/formatarCarga";
import { REGRAS_LISTA_REPETICOES } from "../../../../helpers/series/series";
import { FormularioImportacao } from "../importacao";
import { cores } from "../../../../theme/cores";

// Os campos do formulário são texto, mas o Path genérico do react-hook-form
// também inclui o array de exercícios; por isso as regras (de texto) entram
// com este ajuste de tipo.
const regrasCarga = REGRAS_CARGA as never;
const regrasRepeticoes = REGRAS_LISTA_REPETICOES as never;

interface RevisaoImportacaoProps {
  control: Control<FormularioImportacao>;
  salvando: boolean;
  aoSalvar: () => void;
  aoLerNovamente: () => void;
}

// O OCR é um rascunho: o usuário confere e corrige tudo antes de gravar.
export const RevisaoImportacao = ({
  control,
  salvando,
  aoSalvar,
  aoLerNovamente,
}: RevisaoImportacaoProps) => {
  const { fields: exercicios, remove } = useFieldArray({
    control,
    name: "exercicios",
  });

  return (
    <View>
      <Input
        name="titulo"
        control={control}
        label="Nome do subtreino"
        placeholder="Ex.: Peito"
        required="O nome é obrigatório"
        maxLength={70}
      />
      <Input
        name="descricao"
        control={control}
        label="Descrição"
        placeholder="Ex.: Treino A"
      />

      <Text style={styles.secao}>
        Exercícios lidos ({exercicios.length}) — confira antes de salvar
      </Text>

      {exercicios.map((exercicio, indice) => (
        <Card key={exercicio.id}>
          <View style={styles.cabecalhoExercicio}>
            <Text style={styles.numero}>Exercício {indice + 1}</Text>
            <TouchableOpacity onPress={() => remove(indice)}>
              <Feather name="trash" size={20} color={cores.perigo} />
            </TouchableOpacity>
          </View>
          <Input
            name={`exercicios.${indice}.nome`}
            control={control}
            label="Nome"
            required="O nome do exercício é obrigatório"
            maxLength={70}
          />
          <Input
            name={`exercicios.${indice}.carga`}
            control={control}
            label="Carga (kg)"
            keyboardType="number-pad"
            required="Informe a carga"
            rules={regrasCarga}
          />
          <Input
            name={`exercicios.${indice}.series`}
            control={control}
            label="Repetições por série"
            placeholder="Ex.: 12, 10, 8"
            rules={regrasRepeticoes}
          />
        </Card>
      ))}

      <View style={styles.botoes}>
        {salvando ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <>
            <Button
              title="Salvar subtreino"
              onPress={aoSalvar}
            />
            <Button
              title="Trocar imagens"
              variant="neutral"
              onPress={aoLerNovamente}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  secao: {
    fontSize: 15,
    fontWeight: "bold",
    color: cores.destaque,
    marginVertical: 8,
  },
  cabecalhoExercicio: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  numero: { fontSize: 14, fontWeight: "700", color: cores.ciano },
  botoes: { gap: 10, marginTop: 8 },
});
