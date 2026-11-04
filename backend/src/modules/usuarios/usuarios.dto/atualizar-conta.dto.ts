import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Dados que o próprio usuário pode alterar na sua conta (PUT /conta). A
// senha muda só pela recuperação por email (/auth/recuperar-senha); perfil e
// status ativo só pelo administrador (PUT /usuarios/:id).
export class AtualizarContaDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;
}
