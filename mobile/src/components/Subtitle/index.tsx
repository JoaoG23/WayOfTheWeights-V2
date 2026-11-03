import { Text, StyleSheet } from "react-native";
import { cores } from "../../theme/cores";

type Props = {
  title: string;
};

export const Subtitle = ({ title }: Props) => {
  return <Text style={styles.subtitle}>{title}</Text>;
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: cores.textoSecundario,
    marginBottom: 20,
  },
});
