import { IsBoolean, IsEnum, IsOptional, MinLength } from 'class-validator';
import { PerfilUsuario } from '../../../generated/prisma/enums';
import { AtualizarContaDto } from './atualizar-conta.dto';

// Atualização de usuário pelo administrador: além dos dados da conta, pode
// alterar perfil, status ativo e redefinir a senha (sem saber a atual).
export class AtualizarUsuarioDto extends AtualizarContaDto {
  @IsOptional()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha?: string;

  @IsOptional()
  @IsEnum(PerfilUsuario, { message: 'Perfil inválido' })
  perfil?: PerfilUsuario;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
