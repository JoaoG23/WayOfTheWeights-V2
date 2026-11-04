export class SubtreinoRespostaDto {
  id: number;
  treinoId: number;
  titulo: string;
  descricao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}
