import { IsInt, Max, Min } from 'class-validator';
import {
  REPETICOES_MAXIMAS,
  REPETICOES_MINIMAS,
} from '../../../shared/constantes/limites-serie';

export class CriarSerieDto {
  @IsInt({ message: 'repeticoes deve ser um número inteiro' })
  @Min(REPETICOES_MINIMAS, {
    message: `repeticoes deve ser no mínimo ${REPETICOES_MINIMAS}`,
  })
  @Max(REPETICOES_MAXIMAS, {
    message: `repeticoes deve ser no máximo ${REPETICOES_MAXIMAS}`,
  })
  repeticoes: number;
}
