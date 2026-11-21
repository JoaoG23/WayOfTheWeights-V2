// Paleta do Way Of The Weights (design do app e frontend v1).
export const cores = {
  // Fundo das telas e cartões (tema escuro)
  fundo: "#232329",
  cartao: "#4A4A5E",
  cartaoClaro: "#636573",
  // Cartão com 70% de opacidade (#4A4A5E): deixa a anilha de fundo transparecer.
  cartaoTranslucido: "rgba(74, 74, 94, 0.7)",

  // Destaques
  destaque: "#DCFC34",
  ciano: "#20E5E0",

  // Estados
  sucesso: "#56D688",
  perigo: "#D65D56",
  neutro: "#8E8E93",

  // Textos
  texto: "#FFFFFF",
  textoSecundario: "#C7C7D1",
  textoEscuro: "#323240",
};

// Aplica opacidade (0 a 1) a uma cor hexadecimal de 6 dígitos (#RRGGBB).
export const comOpacidade = (corHexadecimal: string, opacidade: number) =>
  `${corHexadecimal}${Math.round(opacidade * 255)
    .toString(16)
    .padStart(2, "0")}`;
