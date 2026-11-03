export interface Exercicio {
  id: number;
  treinoId: number;
  nome: string;
  cargaAtual: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface HistoricoCarga {
  id: number;
  carga: number;
  registradoEm: string;
}

// Formulários guardam a carga como texto (aceita vírgula); a conversão para
// número acontece no envio.
export interface DadosNovoExercicio {
  nome: string;
  carga: string;
}
