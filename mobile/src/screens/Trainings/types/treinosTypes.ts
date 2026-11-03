export interface Treino {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadosTreino {
  titulo: string;
  descricao: string;
}
