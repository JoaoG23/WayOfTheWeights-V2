import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { buscarFotoUsuario, enviarFotoUsuario, removerFotoUsuario } from "../api";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { cores } from "../../../theme/cores";

const TAMANHO_AVATAR = 84;

interface AvatarEditavelProps {
  // Versão da foto atual (GET /conta); nulo se o usuário não tem foto.
  fotoVersao: string | null;
}

// Foto de perfil: toque para escolher da galeria, tirar uma foto ou remover.
export const AvatarEditavel = ({ fotoVersao }: AvatarEditavelProps) => {
  const queryClient = useQueryClient();

  // fotoVersao muda a cada nova foto, então a imagem baixada nunca fica velha.
  const { data: fotoDataUri } = useQuery({
    queryKey: ["foto", fotoVersao],
    queryFn: () => buscarFotoUsuario(fotoVersao as string),
    enabled: !!fotoVersao,
    staleTime: Infinity,
  });

  const atualizarConta = () =>
    queryClient.invalidateQueries({ queryKey: ["conta"] });

  const { mutate: enviarFoto, isPending: enviando } = useMutation({
    mutationFn: enviarFotoUsuario,
    onSuccess: () => {
      atualizarConta();
      Toast.show({ type: "success", text1: "Sucesso", text2: "Foto atualizada!" });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível enviar a foto",
        text2: obterMensagemErro(erro, "Use uma imagem de até 2 MB"),
      });
    },
  });

  const { mutate: removerFoto, isPending: removendo } = useMutation({
    mutationFn: removerFotoUsuario,
    onSuccess: () => {
      atualizarConta();
      Toast.show({ type: "success", text1: "Sucesso", text2: "Foto removida!" });
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: obterMensagemErro(erro, "Erro ao remover a foto"),
      });
    },
  });

  // Recorte quadrado e qualidade reduzida, para a foto caber no limite de 2 MB.
  const OPCOES_PICKER: ImagePicker.ImagePickerOptions = {
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  };

  const enviarSelecao = (resultado: ImagePicker.ImagePickerResult) => {
    if (resultado.canceled) return;
    const imagem = resultado.assets[0];
    enviarFoto({
      uri: imagem.uri,
      nome: imagem.fileName ?? "foto.jpg",
      tipo: imagem.mimeType ?? "image/jpeg",
    });
  };

  const escolherDaGaleria = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      ...OPCOES_PICKER,
      mediaTypes: ["images"],
    });
    enviarSelecao(resultado);
  };

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Toast.show({
        type: "error",
        text1: "Permissão negada",
        text2: "Libere o acesso à câmera nas configurações do celular.",
      });
      return;
    }
    enviarSelecao(await ImagePicker.launchCameraAsync(OPCOES_PICKER));
  };

  const abrirOpcoes = () => {
    Alert.alert("Foto de perfil", undefined, [
      { text: "Escolher da galeria", onPress: escolherDaGaleria },
      { text: "Tirar foto", onPress: tirarFoto },
      ...(fotoVersao
        ? [
            {
              text: "Remover foto",
              style: "destructive" as const,
              onPress: () => removerFoto(),
            },
          ]
        : []),
      { text: "Cancelar", style: "cancel" as const },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.avatar}
      onPress={abrirOpcoes}
      disabled={enviando || removendo}
    >
      {fotoDataUri ? (
        <Image source={{ uri: fotoDataUri }} style={styles.foto} />
      ) : (
        <Ionicons name="person" size={44} color={cores.textoEscuro} />
      )}
      <View style={styles.selo}>
        <Ionicons name="camera" size={14} color={cores.textoEscuro} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: TAMANHO_AVATAR,
    height: TAMANHO_AVATAR,
    borderRadius: TAMANHO_AVATAR / 2,
    backgroundColor: cores.destaque,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  foto: {
    width: TAMANHO_AVATAR,
    height: TAMANHO_AVATAR,
    borderRadius: TAMANHO_AVATAR / 2,
  },
  selo: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: cores.destaque,
    borderWidth: 2,
    borderColor: cores.fundo,
    alignItems: "center",
    justifyContent: "center",
  },
});
