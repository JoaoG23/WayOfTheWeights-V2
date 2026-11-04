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

// Resumo das séries do exercício, ex.: "3 séries: 12 / 10 / 8".
export const formatarSeries = (repeticoesPorSerie: number[]): string => {
  if (repeticoesPorSerie.length === 0) return "Sem séries";
  const rotuloSeries = repeticoesPorSerie.length === 1 ? "série" : "séries";
  return `${repeticoesPorSerie.length} ${rotuloSeries}: ${repeticoesPorSerie.join(" / ")}`;
};
