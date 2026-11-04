import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CARGA_MAXIMA_KG,
  CARGA_MINIMA_KG,
} from '../../../shared/constantes/limites-carga';

export class AtualizarExercicioDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(70, { message: 'Nome deve ter no máximo 70 caracteres' })
  nome?: string;

  @IsOptional()
  @IsInt({ message: 'cargaAtual deve ser um número inteiro' })
  @Min(CARGA_MINIMA_KG, {
    message: `cargaAtual deve ser no mínimo ${CARGA_MINIMA_KG} kg`,
  })
  @Max(CARGA_MAXIMA_KG, {
    message: `cargaAtual deve ser no máximo ${CARGA_MAXIMA_KG} kg`,
  })
  cargaAtual?: number;
}
