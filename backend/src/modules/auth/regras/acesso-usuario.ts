import { PerfilUsuario } from '../../../generated/prisma/enums';
import { PayloadJwt } from '../tipos/payload-jwt';

// O isolamento entre contas é garantido nas consultas (sempre filtradas pelo
// contaId do token); as regras abaixo tratam o acesso dentro da conta.

export function ehAdministrador(usuarioAutenticado: PayloadJwt): boolean {
  return usuarioAutenticado.perfil === PerfilUsuario.ADMINISTRADOR;
}

// Administrador e treinador gerenciam os treinos de qualquer usuário da
// própria conta; o aluno, só os dele.
export function podeGerenciarTreinosDaConta(
  usuarioAutenticado: PayloadJwt,
): boolean {
  return (
    ehAdministrador(usuarioAutenticado) ||
    usuarioAutenticado.perfil === PerfilUsuario.TREINADOR
  );
}

// Define de qual usuário são os dados da operação: o aluno sempre opera
// sobre os próprios dados (usuarioIdInformado é ignorado); administrador e
// treinador operam sobre os próprios dados ou, se informarem, sobre os de
// outro usuário da conta.
export function resolverUsuarioIdAlvo(
  usuarioAutenticado: PayloadJwt,
  usuarioIdInformado?: number,
): number {
  if (podeGerenciarTreinosDaConta(usuarioAutenticado) && usuarioIdInformado) {
    return usuarioIdInformado;
  }
  return usuarioAutenticado.sub;
}

// Pressupõe que o recurso já foi buscado restrito à conta do usuário.
export function podeAcessarRecursoDoUsuario(
  usuarioAutenticado: PayloadJwt,
  usuarioIdDonoRecurso: number,
): boolean {
  return (
    podeGerenciarTreinosDaConta(usuarioAutenticado) ||
    usuarioAutenticado.sub === usuarioIdDonoRecurso
  );
}
