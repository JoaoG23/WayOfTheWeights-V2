import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Origens do frontend separadas por vírgula. Sem ORIGIN_CLIENT nenhuma
// origem cross-site é aceita.
const origensPermitidas = process.env.ORIGIN_CLIENT
  ? process.env.ORIGIN_CLIENT.split(',').map((origem) => origem.trim())
  : [];

export const corsConfig: CorsOptions = {
  origin: origensPermitidas,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  // Necessário para o browser enviar/receber o cookie do token em
  // requisições cross-origin (frontend com credentials: 'include').
  credentials: true,
  maxAge: 86400,
};
