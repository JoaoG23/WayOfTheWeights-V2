// Limites da importação de subtreinos por imagens (OCR com Gemini).
export const MAXIMO_IMAGENS_POR_LEITURA = 10;
export const TAMANHO_MAXIMO_IMAGEM_BYTES = 8 * 1024 * 1024;
export const TIPOS_IMAGEM_ACEITOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
// Tamanho máximo do JSON padronizado de importação.
export const MAXIMO_EXERCICIOS_POR_SUBTREINO = 30;
export const MAXIMO_SERIES_POR_EXERCICIO = 20;
