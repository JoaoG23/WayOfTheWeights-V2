import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { Title } from "../../../components/Title";
import { Subtitle } from "../../../components/Subtitle";
import { Input } from "../../../components/Input/Input";
import { Button } from "../../../components/Button";
import { DecoracaoFundo } from "../../../components/DecoracaoFundo";
import { Carregando, MensagemTela } from "../../../components/Feedback";
import { NOME_PERFIL } from "../../../helpers/perfis/perfis";
import { obterMensagemErro } from "../../../helpers/obterMensagemErro/obterMensagemErro";
import { buscarPlanoConta, obterPerfisComVaga } from "../../Account/api";
import { criarUsuario } from "../api";
import { DadosNovoUsuario } from "../types/usuariosTypes";
import { cores } from "../../../theme/cores";
import type { TNavigationScreenProps } from "../../../Routes";

export const AddUser = () => {
  const navigation = useNavigation<TNavigationScreenProps>();
  const queryClient = useQueryClient();
  const { control, handleSubmit, setValue } = useForm<DadosNovoUsuario>({
    defaultValues: { nome: "", email: "", senha: "", perfil: "ALUNO" },
  });

  const { data: plano, isLoading } = useQuery({
    queryKey: ["plano"],
    queryFn: buscarPlanoConta,
  });
  const perfisComVaga = plano ? obterPerfisComVaga(plano) : [];

  // Começa no primeiro perfil com vaga, para não sugerir um perfil lotado.
  useEffect(() => {
    if (perfisComVaga.length > 0 && !perfisComVaga.includes("ALUNO")) {
      setValue("perfil", perfisComVaga[0]);
    }
  }, [perfisComVaga.join(), setValue]);

  const { mutate: salvarUsuario, isPending } = useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["plano"] });
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Usuário cadastrado na conta!",
      });
      navigation.goBack();
    },
    onError: (erro) => {
      Toast.show({
        type: "error",
        text1: "Não foi possível cadastrar",
        text2: obterMensagemErro(erro, "Erro ao cadastrar o usuário"),
      });
    },
  });

  if (isLoading) return <Carregando />;
  if (perfisComVaga.length === 0) {
    return <MensagemTela texto="Não há vagas disponíveis no seu plano." />;
  }

  return (
    <View style={styles.container}>
      <DecoracaoFundo />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Title title="Novo Usuário" />
        <Subtitle title="Ele entra na sua conta com o email e a senha abaixo" />
        <Input
          name="nome"
          control={control}
          label="Nome"
          required="Informe o nome"
        />
        <Input
          name="email"
          control={control}
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          required="Informe o email"
        />
        <Input
          name="senha"
          control={control}
          label="Senha inicial"
          secureTextEntry
          required="Informe uma senha"
          rules={{
            minLength: { value: 6, message: "Mínimo de 6 caracteres" },
          }}
        />

        <Text style={styles.rotulo}>Perfil</Text>
        <Controller
          control={control}
          name="perfil"
          render={({ field: { value, onChange } }) => (
            <View style={styles.opcoesPerfil}>
              {perfisComVaga.map((perfil) => {
                const selecionado = value === perfil;
                return (
                  <TouchableOpacity
                    key={perfil}
                    style={[styles.chip, selecionado && styles.chipSelecionado]}
                    onPress={() => onChange(perfil)}
                  >
                    <Text
                      style={[
                        styles.textoChip,
                        selecionado && styles.textoChipSelecionado,
                      ]}
                    >
                      {NOME_PERFIL[perfil]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        <Text style={styles.dica}>
          Só aparecem os perfis com vaga no seu plano.
        </Text>

        {isPending ? (
          <ActivityIndicator size="large" color={cores.destaque} />
        ) : (
          <Button
            title="Cadastrar"
            onPress={handleSubmit((dadosUsuario) => salvarUsuario(dadosUsuario))}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16 },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: cores.texto,
    marginBottom: 8,
    marginLeft: 4,
  },
  opcoesPerfil: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: cores.destaque,
  },
  chipSelecionado: { backgroundColor: cores.destaque },
  textoChip: { color: cores.destaque, fontWeight: "600" },
  textoChipSelecionado: { color: cores.textoEscuro },
  dica: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 8,
    marginBottom: 20,
    marginLeft: 4,
  },
});
