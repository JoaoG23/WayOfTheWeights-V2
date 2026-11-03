import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export type PerfilUsuario = "ADMINISTRADOR" | "TREINADOR" | "ALUNO";

export interface UsuarioSessao {
  id: number;
  contaId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

interface AuthContextValue {
  usuario: UsuarioSessao | null;
  carregandoSessao: boolean;
  entrar: (dadosLogin: DadosLogin) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // O cookie da sessão sobrevive ao fechamento do app: se ainda for válido,
  // GET /conta devolve o usuário e o login é pulado.
  useEffect(() => {
    api
      .get<UsuarioSessao>("/conta")
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => setUsuario(null))
      .finally(() => setCarregandoSessao(false));
  }, []);

  // Qualquer 401 (sessão expirada ou inválida) volta para o login.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, (erro) => {
      if (erro?.response?.status === 401) setUsuario(null);
      return Promise.reject(erro);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const entrar = useCallback(async (dadosLogin: DadosLogin) => {
    const resposta = await api.post<UsuarioSessao>("/auth/login", dadosLogin);
    setUsuario(resposta.data);
  }, []);

  const sair = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUsuario(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ usuario, carregandoSessao, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return contexto;
};
