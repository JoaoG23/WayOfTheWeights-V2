export const formatarCarga = (cargaEmKg: number): string =>
  `${cargaEmKg.toLocaleString("pt-BR")} kg`;

// Aceita vírgula ou ponto e até 2 casas decimais (ex.: "42,5").
export const REGEX_CARGA = /^\d+([.,]\d{1,2})?$/;

export const converterTextoEmCarga = (textoCarga: string): number =>
  Number(textoCarga.replace(",", "."));

export const formatarData = (dataIso: string): string =>
  new Date(dataIso).toLocaleDateString("pt-BR");
