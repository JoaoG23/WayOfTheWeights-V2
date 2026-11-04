import { IsEmail, Matches, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Matches(/^\d{6}$/, { message: 'Código deve ter 6 dígitos' })
  codigo: string;

  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
