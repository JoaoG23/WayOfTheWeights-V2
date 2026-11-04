import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// Troca da própria senha (PUT /conta/senha): exige a senha atual para que uma
// sessão aberta em outro aparelho não baste para trocá-la.
export class TrocarSenhaDto {
  @IsString({ message: 'Senha atual deve ser um texto' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  senhaAtual: string;

  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
