import { PerfilUsuario } from "../../contexts/AuthContext";

export const PERFIS: PerfilUsuario[] = ["ADMINISTRADOR", "TREINADOR", "ALUNO"];

export const NOME_PERFIL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  TREINADOR: "Treinador",
  ALUNO: "Aluno",
};

export const NOME_PERFIL_PLURAL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: "Administradores",
  TREINADOR: "Treinadores",
  ALUNO: "Alunos",
};
