// Faixa de repetições aceita por série no backend.
export const REPETICOES_MINIMAS = 1;
export const REPETICOES_MAXIMAS = 100;

export const converterTextoEmRepeticoes = (textoRepeticoes: string): number =>
  Number(textoRepeticoes);

// Regras do react-hook-form para o campo de repetições: inteiro dentro da faixa.
export const REGRAS_REPETICOES = {
  pattern: { value: /^\d+$/, message: "Use um número inteiro" },
  validate: (textoRepeticoes: string) => {
    const repeticoes = converterTextoEmRepeticoes(textoRepeticoes);
    return (
      (repeticoes >= REPETICOES_MINIMAS && repeticoes <= REPETICOES_MAXIMAS) ||
      `As repetições devem ser de ${REPETICOES_MINIMAS} a ${REPETICOES_MAXIMAS}`
    );
  },
};

// Máximo de séries por exercício aceito na importação (mesma regra do backend).
export const SERIES_MAXIMAS_POR_EXERCICIO = 20;

// "12, 10, 8" (ou "12 10 8", "12/10/8") -> [12, 10, 8]. Vazio -> [].
export const converterTextoEmListaDeRepeticoes = (textoSeries: string): number[] =>
  textoSeries
    .split(/[,;/\s]+/)
    .filter(Boolean)
    .map(converterTextoEmRepeticoes);

// Regras do campo que lista as repetições de cada série (pode ficar vazio).
export const REGRAS_LISTA_REPETICOES = {
  validate: (textoSeries: string) => {
    const listaRepeticoes = converterTextoEmListaDeRepeticoes(textoSeries);
    const repeticoesValidas = listaRepeticoes.every(
      (repeticoes) =>
        Number.isInteger(repeticoes) &&
        repeticoes >= REPETICOES_MINIMAS &&
        repeticoes <= REPETICOES_MAXIMAS
    );
    if (!repeticoesValidas) {
      return `Use números de ${REPETICOES_MINIMAS} a ${REPETICOES_MAXIMAS}, ex.: 12, 10, 8`;
    }
    return (
      listaRepeticoes.length <= SERIES_MAXIMAS_POR_EXERCICIO ||
      `No máximo ${SERIES_MAXIMAS_POR_EXERCICIO} séries`
    );
  },
};

// Resumo das séries do exercício, ex.: "3 séries: 12 / 10 / 8".
export const formatarSeries = (repeticoesPorSerie: number[]): string => {
  if (repeticoesPorSerie.length === 0) return "Sem séries";
  const rotuloSeries = repeticoesPorSerie.length === 1 ? "série" : "séries";
  return `${repeticoesPorSerie.length} ${rotuloSeries}: ${repeticoesPorSerie.join(" / ")}`;
};
