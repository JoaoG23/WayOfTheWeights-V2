// Faixa do catálogo compartilhado de cargas do backend (kg inteiros).
export const CARGA_MINIMA_KG = 1;
export const CARGA_MAXIMA_KG = 1500;

export const formatarCarga = (cargaEmKg: number): string =>
  `${cargaEmKg.toLocaleString("pt-BR")} kg`;

export const converterTextoEmCarga = (textoCarga: string): number =>
  Number(textoCarga);

// Regras do react-hook-form para campos de carga: inteiro dentro do catálogo.
export const REGRAS_CARGA = {
  pattern: { value: /^\d+$/, message: "Use um número inteiro de kg" },
  validate: (textoCarga: string) => {
    const cargaEmKg = converterTextoEmCarga(textoCarga);
    return (
      (cargaEmKg >= CARGA_MINIMA_KG && cargaEmKg <= CARGA_MAXIMA_KG) ||
      `A carga deve ser de ${CARGA_MINIMA_KG} a ${CARGA_MAXIMA_KG} kg`
    );
  },
};

export const formatarData = (dataIso: string): string =>
  new Date(dataIso).toLocaleDateString("pt-BR");
