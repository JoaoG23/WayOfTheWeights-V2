import { CookieOptions } from 'express';

const ehProducao = process.env.NODE_ENV === 'production';

export const NOME_COOKIE_TOKEN = 'jwt';

// Sem maxAge aqui: o mesmo config é usado no clearCookie do logout, que não
// deve receber maxAge. O tempo de vida é aplicado só no login.
export const cookieConfig: CookieOptions = {
  httpOnly: true, // JS do browser não consegue ler o cookie (proteção contra XSS)
  secure: ehProducao, // só trafega via HTTPS em produção
  sameSite: ehProducao ? 'strict' : 'lax', // 'strict' em produção bloqueia envio cross-site (proteção contra CSRF)
  path: '/', // válido em todas as rotas da API
};
