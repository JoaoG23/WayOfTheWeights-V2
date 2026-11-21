import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { MAXIMO_EXERCICIOS_POR_SUBTREINO } from '../../../shared/constantes/limites-importacao';

export class CriarConclusaoDto {
  // Ids dos exercícios marcados no checklist: todos os do subtreino (conclusão
  // completa) ou só alguns (conclusão parcial).
  @IsArray({ message: 'exerciciosConcluidosIds deve ser uma lista' })
  @ArrayMinSize(1, { message: 'Marque ao menos um exercício' })
  @ArrayMaxSize(MAXIMO_EXERCICIOS_POR_SUBTREINO, {
    message: `Informe no máximo ${MAXIMO_EXERCICIOS_POR_SUBTREINO} exercícios`,
  })
  @IsInt({ each: true, message: 'Cada id de exercício deve ser um inteiro' })
  exerciciosConcluidosIds: number[];
}
