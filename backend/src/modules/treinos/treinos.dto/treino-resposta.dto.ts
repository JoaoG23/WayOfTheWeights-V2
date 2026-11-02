export class TreinoRespostaDto {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}
