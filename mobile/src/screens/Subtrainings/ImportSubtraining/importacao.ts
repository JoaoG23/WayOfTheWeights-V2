import { converterTextoEmCarga } from "../../../helpers/formatarCarga/formatarCarga";
import { converterTextoEmListaDeRepeticoes } from "../../../helpers/series/series";
import { SubtreinoImportacao } from "../types/subtreinosTypes";

// Os campos de texto do app trabalham com string; a conversão para o JSON
// padronizado da API acontece só ao salvar.
export interface ExercicioFormulario {
  nome: string;
  carga: string;
  series: string;
}

export interface FormularioImportacao {
  titulo: string;
  descricao: string;
  exercicios: ExercicioFormulario[];
}

export const paraFormulario = (
  leitura: SubtreinoImportacao
): FormularioImportacao => ({
  titulo: leitura.titulo,
  descricao: leitura.descricao ?? "",
  exercicios: leitura.exercicios.map((exercicio) => ({
    nome: exercicio.nome,
    carga: String(exercicio.cargaAtual),
    series: exercicio.repeticoesPorSerie.join(", "),
  })),
});

export const paraDadosDaApi = (
  formulario: FormularioImportacao
): SubtreinoImportacao => ({
  titulo: formulario.titulo.trim(),
  descricao: formulario.descricao.trim() || undefined,
  exercicios: formulario.exercicios.map((exercicio) => ({
    nome: exercicio.nome.trim(),
    cargaAtual: converterTextoEmCarga(exercicio.carga),
    repeticoesPorSerie: converterTextoEmListaDeRepeticoes(exercicio.series),
  })),
});
