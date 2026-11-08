import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CARGA_MAXIMA_KG,
  CARGA_MINIMA_KG,
} from '../../../shared/constantes/limites-carga';
import {
  REPETICOES_MAXIMAS,
  REPETICOES_MINIMAS,
} from '../../../shared/constantes/limites-serie';
import {
  MAXIMO_EXERCICIOS_POR_SUBTREINO,
  MAXIMO_SERIES_POR_EXERCICIO,
} from '../../../shared/constantes/limites-importacao';

export class ExercicioImportacaoDto {
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

  // Uma posição por série (ex.: [12, 10, 8]). Quando omitido ou vazio, as
  // séries já existentes do exercício são mantidas.
  @IsOptional()
  @IsArray({ message: 'repeticoesPorSerie deve ser uma lista' })
  @ArrayMaxSize(MAXIMO_SERIES_POR_EXERCICIO, {
    message: `Um exercício pode ter no máximo ${MAXIMO_SERIES_POR_EXERCICIO} séries`,
  })
  @IsInt({
    each: true,
    message: 'Cada repetição deve ser um número inteiro',
  })
  @Min(REPETICOES_MINIMAS, {
    each: true,
    message: `Cada repetição deve ser no mínimo ${REPETICOES_MINIMAS}`,
  })
  @Max(REPETICOES_MAXIMAS, {
    each: true,
    message: `Cada repetição deve ser no máximo ${REPETICOES_MAXIMAS}`,
  })
  repeticoesPorSerie?: number[];
}

// JSON padronizado de transferência de um subtreino: é o que a leitura das
// imagens (OCR) devolve e o que a importação recebe.
export class SubtreinoImportacaoDto {
  @IsString({ message: 'Título deve ser um texto' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MaxLength(70, { message: 'Título deve ter no máximo 70 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser um texto' })
  descricao?: string;

  @IsArray({ message: 'exercicios deve ser uma lista' })
  @ArrayMinSize(1, { message: 'Informe ao menos um exercício' })
  @ArrayMaxSize(MAXIMO_EXERCICIOS_POR_SUBTREINO, {
    message: `Um subtreino pode ter no máximo ${MAXIMO_EXERCICIOS_POR_SUBTREINO} exercícios`,
  })
  @ValidateNested({ each: true })
  @Type(() => ExercicioImportacaoDto)
  exercicios: ExercicioImportacaoDto[];
}
