import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CriarSubtreinoDto {
  @IsString({ message: 'Título deve ser um texto' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(70, { message: 'Título deve ter no máximo 70 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser um texto' })
  descricao?: string;
}
