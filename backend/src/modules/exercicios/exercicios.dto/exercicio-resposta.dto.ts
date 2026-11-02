export class ExercicioRespostaDto {
  id: number;
  treinoId: number;
  nome: string;
  cargaAtual: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class HistoricoCargaRespostaDto {
  id: number;
  carga: number;
  registradoEm: Date;
}
