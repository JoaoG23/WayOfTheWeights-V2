import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const SENHA_PADRAO = 'SenhaForte123!';

// Autocadastro público: cria uma conta BASICO com o administrador
// proprietário, como no app.
export async function criarContaEObterCookie(
  app: INestApplication,
  email = 'admin@example.com',
): Promise<{ usuarioId: number; contaId: number; cookie: string }> {
  const respostaCadastro = await request(app.getHttpServer())
    .post('/conta')
    .send({ nome: 'Administrador', email, senha: SENHA_PADRAO });

  const cookie = await fazerLoginEObterCookie(app, email);
  return {
    usuarioId: respostaCadastro.body.id,
    contaId: respostaCadastro.body.contaId,
    cookie,
  };
}

// Usuário criado pelo administrador dentro da conta dele.
export async function criarUsuarioNaContaEObterCookie(
  app: INestApplication,
  cookieAdministrador: string,
  perfil: 'ADMINISTRADOR' | 'TREINADOR' | 'ALUNO',
  email: string,
): Promise<{ usuarioId: number; cookie: string }> {
  const respostaCriacao = await request(app.getHttpServer())
    .post('/usuarios')
    .set('Cookie', cookieAdministrador)
    .send({ nome: `Usuário ${perfil}`, email, senha: SENHA_PADRAO, perfil });

  const cookie = await fazerLoginEObterCookie(app, email);
  return { usuarioId: respostaCriacao.body.id, cookie };
}

// Devolve só o par "jwt=<token>" do Set-Cookie, pronto para .set('Cookie').
export async function fazerLoginEObterCookie(
  app: INestApplication,
  email: string,
  senha = SENHA_PADRAO,
): Promise<string> {
  const respostaLogin = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });

  const cookies = [respostaLogin.headers['set-cookie'] ?? []].flat();
  const cookieToken = cookies.find((cookie) => cookie.startsWith('jwt='));
  return cookieToken?.split(';')[0];
}
