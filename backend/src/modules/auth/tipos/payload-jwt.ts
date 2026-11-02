import { PerfilUsuario } from '../../../generated/prisma/enums';

export type PayloadJwt = {
  sub: number;
  // Conta (assinante) do usuário — todo acesso a dados é restrito a ela.
  contaId: number;
  perfil: PerfilUsuario;
  nome: string;
  email: string;
};
