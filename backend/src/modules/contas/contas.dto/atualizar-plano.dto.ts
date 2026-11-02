import { IsEnum } from 'class-validator';
import { PlanoConta } from '../../../generated/prisma/enums';

export class AtualizarPlanoDto {
  @IsEnum(PlanoConta, { message: 'Plano inválido' })
  plano: PlanoConta;
}
