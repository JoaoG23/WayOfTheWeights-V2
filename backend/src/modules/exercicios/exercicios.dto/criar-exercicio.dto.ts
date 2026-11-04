import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CARGA_MAXIMA_KG,
  CARGA_MINIMA_KG,
} from '../../../shared/constantes/limites-carga';

export class CriarExercicioDto {
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(70, { message: 'Nome deve ter no máximo 70 caracteres' })
  nome: string;

  // Em kg inteiros, dentro do catálogo compartilhado de cargas.
  @IsInt({ message: 'cargaAtual deve ser um número inteiro' })
  @Min(CARGA_MINIMA_KG, {
    message: `cargaAtual deve ser no mínimo ${CARGA_MINIMA_KG} kg`,
  })
  @Max(CARGA_MAXIMA_KG, {
    message: `cargaAtual deve ser no máximo ${CARGA_MAXIMA_KG} kg`,
  })
  cargaAtual: number;
}
