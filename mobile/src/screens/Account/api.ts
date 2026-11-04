import api from "../../services/api";
import { PerfilUsuario } from "../../contexts/AuthContext";

export interface MinhaConta {
  id: number;
  contaId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  proprietario: boolean;
}

export interface PlanoConta {
  contaId: number;
  plano: "BASICO" | "BETA";
  limites: Record<PerfilUsuario, number>;
  usuariosPorPerfil: Record<PerfilUsuario, number>;
}

export const buscarMinhaConta = async (): Promise<MinhaConta> => {
  const response = await api.get<MinhaConta>("/conta");
  return response.data;
};

export const buscarPlanoConta = async (): Promise<PlanoConta> => {
  const response = await api.get<PlanoConta>("/conta/plano");
  return response.data;
};

// Perfis que ainda têm vaga no plano atual da conta.
export const obterPerfisComVaga = (plano: PlanoConta): PerfilUsuario[] =>
  (Object.keys(plano.limites) as PerfilUsuario[]).filter(
    (perfil) => plano.usuariosPorPerfil[perfil] < plano.limites[perfil]
  );
