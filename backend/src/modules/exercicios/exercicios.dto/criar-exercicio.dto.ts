import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarExercicioDto {
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(70, { message: 'Nome deve ter no máximo 70 caracteres' })
  nome: string;

  // Em kg. Aceita frações (ex.: anilhas de 1,25 kg) e zero (peso corporal).
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'cargaAtual deve ser um número com até 2 casas decimais' },
  )
  @Min(0, { message: 'cargaAtual não pode ser negativa' })
  cargaAtual: number;
}
