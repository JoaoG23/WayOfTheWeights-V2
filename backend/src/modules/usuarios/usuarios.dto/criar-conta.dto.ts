import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// Autocadastro (POST /conta): cria uma conta nova e quem se cadastra vira o
// administrador proprietário dela — o perfil não é escolhido aqui.
export class CriarContaDto {
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
