// Fonte única do tempo de vida da sessão: usada na assinatura do JWT e no
// maxAge do cookie, para os dois expirarem juntos.
export const TEMPO_EXPIRACAO_TOKEN_SEGUNDOS = 60 * 60 * 24;
