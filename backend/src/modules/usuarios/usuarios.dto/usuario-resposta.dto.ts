import { PerfilUsuario } from '../../../generated/prisma/enums';

export class UsuarioRespostaDto {
  id: number;
  contaId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  proprietario: boolean;
  // Versão da foto de perfil (nome do arquivo); nulo se não tem foto. A imagem
  // vem de GET /conta/foto?v=<fotoVersao>.
  fotoVersao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}
