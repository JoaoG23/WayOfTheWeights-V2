import { IsEnum } from 'class-validator';
import { PerfilUsuario } from '../../../generated/prisma/enums';
import { CriarContaDto } from './criar-conta.dto';

// Criação de usuário pelo administrador: igual ao cadastro de conta, mas com
// o perfil escolhido por ele.
export class CriarUsuarioDto extends CriarContaDto {
  @IsEnum(PerfilUsuario, { message: 'Perfil inválido' })
  perfil: PerfilUsuario;
}
