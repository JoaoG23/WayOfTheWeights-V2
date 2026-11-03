import { Text, StyleSheet } from "react-native";
import { cores } from "../../theme/cores";

type Props = {
  title: string;
};

export const Title = ({ title }: Props) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: cores.texto,
    marginBottom: 4,
  },
});
