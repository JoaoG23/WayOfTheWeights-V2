import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Dados que o próprio usuário pode alterar na sua conta (PUT /conta). Perfil
// e status ativo só são alterados pelo administrador (PUT /usuarios/:id).
export class AtualizarContaDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha?: string;
}
