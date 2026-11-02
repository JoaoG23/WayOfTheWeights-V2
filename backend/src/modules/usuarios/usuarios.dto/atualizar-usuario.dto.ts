import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PerfilUsuario } from '../../../generated/prisma/enums';
import { AtualizarContaDto } from './atualizar-conta.dto';

// Atualização de usuário pelo administrador: além dos dados da conta, pode
// alterar perfil e status ativo.
export class AtualizarUsuarioDto extends AtualizarContaDto {
  @IsOptional()
  @IsEnum(PerfilUsuario, { message: 'Perfil inválido' })
  perfil?: PerfilUsuario;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
