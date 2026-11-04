import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { configurarAplicacao } from './../src/app.configuracao';
import {
  criarContaEObterCookie,
  fazerLoginEObterCookie,
} from './helpers/autenticacao';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacao(app);
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "contas" CASCADE;');
  });

  describe('login', () => {
    it('deve gravar o token em cookie httpOnly e não devolvê-lo no corpo (sucesso)', async () => {
      await criarContaEObterCookie(app, 'login@example.com');

      const resposta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', senha: 'SenhaForte123!' });

      expect(resposta.status).toBe(200);
      const cookieToken = [resposta.headers['set-cookie']]
        .flat()
        .find((cookie) => cookie.startsWith('jwt='));
      expect(cookieToken).toContain('HttpOnly');
      expect(cookieToken).toContain('Max-Age=86400');
      expect(resposta.body).not.toHaveProperty('accessToken');
      expect(resposta.body).toMatchObject({
        email: 'login@example.com',
        perfil: 'ADMINISTRADOR',
      });
    });

    it('deve rejeitar senha inválida sem gravar cookie (falha)', async () => {
      await criarContaEObterCookie(app, 'login@example.com');

      const resposta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com', senha: 'senha-errada' });

      expect(resposta.status).toBe(401);
      expect(resposta.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('sessão', () => {
    it('deve autenticar as requisições pelo cookie da sessão (sucesso)', async () => {
      const { cookie } = await criarContaEObterCookie(app);

      const resposta = await request(app.getHttpServer())
        .get('/conta')
        .set('Cookie', cookie);

      expect(resposta.status).toBe(200);
    });

    it('deve aceitar o token via header Bearer como alternativa (sucesso)', async () => {
      const { cookie } = await criarContaEObterCookie(app);
      const token = cookie.replace('jwt=', '');

      const resposta = await request(app.getHttpServer())
        .get('/conta')
        .set('Authorization', `Bearer ${token}`);

      expect(resposta.status).toBe(200);
    });

    it('deve rejeitar requisição sem cookie nem token (falha)', async () => {
      const resposta = await request(app.getHttpServer()).get('/conta');

      expect(resposta.status).toBe(401);
    });

    it('deve rejeitar cookie com token adulterado (falha)', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/conta')
        .set('Cookie', 'jwt=token-adulterado');

      expect(resposta.status).toBe(401);
    });
  });

  describe('trocar senha', () => {
    it('deve exigir a senha atual e permitir login só com a nova (sucesso)', async () => {
      const { cookie } = await criarContaEObterCookie(app, 'senha@example.com');

      const senhaAtualErrada = await request(app.getHttpServer())
        .put('/conta/senha')
        .set('Cookie', cookie)
        .send({ senhaAtual: 'errada', novaSenha: 'NovaSenha123!' });
      expect(senhaAtualErrada.status).toBe(400);

      const troca = await request(app.getHttpServer())
        .put('/conta/senha')
        .set('Cookie', cookie)
        .send({ senhaAtual: 'SenhaForte123!', novaSenha: 'NovaSenha123!' });
      expect(troca.status).toBe(204);

      const loginSenhaAntiga = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'senha@example.com', senha: 'SenhaForte123!' });
      expect(loginSenhaAntiga.status).toBe(401);

      const loginSenhaNova = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'senha@example.com', senha: 'NovaSenha123!' });
      expect(loginSenhaNova.status).toBe(200);
    });

    it('PUT /conta não deve alterar a senha sem conferir a atual (falha)', async () => {
      const { cookie } = await criarContaEObterCookie(app, 'senha@example.com');

      await request(app.getHttpServer())
        .put('/conta')
        .set('Cookie', cookie)
        .send({ senha: 'TentativaSemSenhaAtual' });

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'senha@example.com', senha: 'SenhaForte123!' });
      expect(login.status).toBe(200);
    });
  });

  describe('logout', () => {
    it('deve expirar o cookie da sessão (sucesso)', async () => {
      await criarContaEObterCookie(app, 'logout@example.com');
      const cookie = await fazerLoginEObterCookie(app, 'logout@example.com');

      const resposta = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookie);

      expect(resposta.status).toBe(204);
      const cookieLimpo = [resposta.headers['set-cookie']]
        .flat()
        .find((valor) => valor.startsWith('jwt='));
      expect(cookieLimpo).toMatch(/^jwt=;/);
      expect(cookieLimpo).toContain('Expires=Thu, 01 Jan 1970');
    });
  });
});
