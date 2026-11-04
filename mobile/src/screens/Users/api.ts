import api from "../../services/api";
import { DadosNovoUsuario, UsuarioConta } from "./types/usuariosTypes";

// O plano BETA permite no máximo 9 usuários, então uma página basta.
const QUANTIDADE_MAXIMA_USUARIOS = 50;

export const listarUsuariosDaConta = async (): Promise<UsuarioConta[]> => {
  const response = await api.get<{ usuarios: UsuarioConta[] }>("/usuarios", {
    params: { numeroPagina: 1, quantidadeItens: QUANTIDADE_MAXIMA_USUARIOS },
  });
  return response.data.usuarios;
};

export const criarUsuario = async (
  dadosUsuario: DadosNovoUsuario
): Promise<UsuarioConta> => {
  const response = await api.post<UsuarioConta>("/usuarios", dadosUsuario);
  return response.data;
};

export const removerUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};
