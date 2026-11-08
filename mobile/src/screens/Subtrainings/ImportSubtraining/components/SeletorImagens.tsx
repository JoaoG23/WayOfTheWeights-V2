import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { Button } from "../../../../components/Button";
import { ImagemSelecionada } from "../../types/subtreinosTypes";
import { cores } from "../../../../theme/cores";

// Mesmo limite do backend por leitura.
export const IMAGENS_MAXIMAS = 10;

interface SeletorImagensProps {
  imagens: ImagemSelecionada[];
  aoAlterar: (imagens: ImagemSelecionada[]) => void;
}

const paraImagemSelecionada = (
  asset: ImagePicker.ImagePickerAsset,
  posicao: number
): ImagemSelecionada => ({
  uri: asset.uri,
  nome: asset.fileName ?? `imagem-${Date.now()}-${posicao}.jpg`,
  tipo: asset.mimeType ?? "image/jpeg",
});

export const SeletorImagens = ({ imagens, aoAlterar }: SeletorImagensProps) => {
  const vagasRestantes = IMAGENS_MAXIMAS - imagens.length;

  const adicionar = (assets: ImagePicker.ImagePickerAsset[]) => {
    const novas = assets.map(paraImagemSelecionada);
    aoAlterar([...imagens, ...novas].slice(0, IMAGENS_MAXIMAS));
  };

  const escolherDaGaleria = async () => {
    if (vagasRestantes <= 0) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: vagasRestantes,
      quality: 0.8,
    });
    if (!resultado.canceled) adicionar(resultado.assets);
  };

  const tirarFoto = async () => {
    if (vagasRestantes <= 0) return;
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Toast.show({
        type: "error",
        text1: "Permissão negada",
        text2: "Libere o acesso à câmera nas configurações do celular.",
      });
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled) adicionar(resultado.assets);
  };

  const remover = (uri: string) =>
    aoAlterar(imagens.filter((imagem) => imagem.uri !== uri));

  return (
    <View style={styles.container}>
      <View style={styles.botoes}>
        <View style={styles.botao}>
          <Button title="Galeria" variant="neutral" onPress={escolherDaGaleria} />
        </View>
        <View style={styles.botao}>
          <Button title="Câmera" variant="neutral" onPress={tirarFoto} />
        </View>
      </View>

      <Text style={styles.contador}>
        {imagens.length}/{IMAGENS_MAXIMAS} imagens
      </Text>

      <View style={styles.miniaturas}>
        {imagens.map((imagem) => (
          <View key={imagem.uri} style={styles.miniatura}>
            <Image source={{ uri: imagem.uri }} style={styles.imagem} />
            <TouchableOpacity
              style={styles.remover}
              onPress={() => remover(imagem.uri)}
            >
              <Ionicons name="close" size={16} color={cores.texto} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 20 },
  botoes: { flexDirection: "row", gap: 12 },
  botao: { flex: 1 },
  contador: { fontSize: 13, color: cores.ciano, fontWeight: "600" },
  miniaturas: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  miniatura: { width: 88, height: 88 },
  imagem: { width: 88, height: 88, borderRadius: 12 },
  remover: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: cores.perigo,
    alignItems: "center",
    justifyContent: "center",
  },
});
