import { PerfilUsuario } from '../../../generated/prisma/enums';

export class UsuarioRespostaDto {
  id: number;
  contaId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  proprietario: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
