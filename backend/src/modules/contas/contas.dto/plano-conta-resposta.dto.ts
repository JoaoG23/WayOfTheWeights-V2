import { PlanoConta } from '../../../generated/prisma/enums';
import { QuantidadePorPerfil } from '../regras/limites-plano';

export class PlanoContaRespostaDto {
  contaId: number;
  plano: PlanoConta;
  limites: QuantidadePorPerfil;
  usuariosPorPerfil: QuantidadePorPerfil;
}
