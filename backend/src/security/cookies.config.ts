import { CookieOptions } from 'express';

const ehProducao = process.env.NODE_ENV === 'production';

// Cookie só trafega por HTTPS (secure). Padrão: ligado em produção.
// COOKIE_SECURE=false desliga (ex.: servidor ainda sem HTTPS); com secure
// ligado, uma conexão HTTP não guarda o cookie e o login não persiste.
const cookieSeguro = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : ehProducao;

export const NOME_COOKIE_TOKEN = 'jwt';

// Sem maxAge aqui: o mesmo config é usado no clearCookie do logout, que não
// deve receber maxAge. O tempo de vida é aplicado só no login.
export const cookieConfig: CookieOptions = {
  httpOnly: true, // JS do browser não consegue ler o cookie (proteção contra XSS)
  secure: cookieSeguro, // só trafega via HTTPS (padrão: em produção)
  sameSite: ehProducao ? 'strict' : 'lax', // 'strict' em produção bloqueia envio cross-site (proteção contra CSRF)
  path: '/', // válido em todas as rotas da API
};
