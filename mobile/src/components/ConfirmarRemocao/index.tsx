import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Title } from "../Title";
import { Subtitle } from "../Subtitle";
import { Button } from "../Button";
import { cores } from "../../theme/cores";

interface ConfirmarRemocaoProps {
  titulo: string;
  mensagem: string;
  removendo: boolean;
  aoConfirmar: () => void;
  aoDesistir: () => void;
}

export const ConfirmarRemocao = ({
  titulo,
  mensagem,
  removendo,
  aoConfirmar,
  aoDesistir,
}: ConfirmarRemocaoProps) => (
  <View style={styles.container}>
    <Title title={titulo} />
    <Subtitle title={mensagem} />

    {removendo ? (
      <ActivityIndicator size="large" color={cores.perigo} />
    ) : (
      <View style={styles.botoes}>
        <Button
          title="Confirmar Remoção"
          variant="danger"
          onPress={aoConfirmar}
        />
        <Button title="Desistir" variant="neutral" onPress={aoDesistir} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 20,
    justifyContent: "center",
  },
  botoes: { marginTop: 30, gap: 10 },
});
