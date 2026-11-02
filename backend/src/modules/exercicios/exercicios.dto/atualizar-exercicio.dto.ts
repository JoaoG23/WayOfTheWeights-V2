import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AtualizarExercicioDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(70, { message: 'Nome deve ter no máximo 70 caracteres' })
  nome?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'cargaAtual deve ser um número com até 2 casas decimais' },
  )
  @Min(0, { message: 'cargaAtual não pode ser negativa' })
  cargaAtual?: number;
}
