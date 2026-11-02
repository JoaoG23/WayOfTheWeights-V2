import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

export type QuantidadePorPerfil = Record<PerfilUsuario, number>;

// Quantidade máxima de usuários de cada perfil que uma conta pode ter, por
// plano. Usuários inativos também ocupam vaga (só a remoção libera).
export const LIMITES_POR_PLANO: Record<PlanoConta, QuantidadePorPerfil> = {
  [PlanoConta.BASICO]: {
    [PerfilUsuario.ADMINISTRADOR]: 1,
    [PerfilUsuario.TREINADOR]: 1,
    [PerfilUsuario.ALUNO]: 1,
  },
  [PlanoConta.BETA]: {
    [PerfilUsuario.ADMINISTRADOR]: 3,
    [PerfilUsuario.TREINADOR]: 3,
    [PerfilUsuario.ALUNO]: 3,
  },
};
