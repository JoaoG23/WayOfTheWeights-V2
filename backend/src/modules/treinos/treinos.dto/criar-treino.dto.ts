import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CriarTreinoDto {
  @IsString({ message: 'Título deve ser um texto' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(70, { message: 'Título deve ter no máximo 70 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser um texto' })
  descricao?: string;

  // Só considerado para ADMINISTRADOR e TREINADOR criarem treino para outro
  // usuário da conta; para o ALUNO o treino é sempre dele mesmo.
  @IsOptional()
  @IsInt({ message: 'usuarioId deve ser um número inteiro' })
  usuarioId?: number;
}
