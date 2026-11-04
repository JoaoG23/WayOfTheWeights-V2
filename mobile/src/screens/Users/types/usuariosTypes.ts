import { PerfilUsuario } from "../../../contexts/AuthContext";

export interface UsuarioConta {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  proprietario: boolean;
}

export interface DadosNovoUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}
