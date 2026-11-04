import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { EmailService } from './../src/shared/email/email.service';
import { configurarAplicacao } from './../src/app.configuracao';
import { criarContaEObterCookie } from './helpers/autenticacao';

describe('RecuperacaoSenhaController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Substitui o envio real por SMTP: o código é lido do próprio mock.
  const emailFalso = {
    enviarCodigoRecuperacaoSenha: jest.fn().mockResolvedValue(undefined),
  };
  const obterUltimoCodigoEnviado = (): string => {
    const chamadas = emailFalso.enviarCodigoRecuperacaoSenha.mock.calls;
    return chamadas[chamadas.length - 1][2];
  };

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(emailFalso)
      .compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacao(app);
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    emailFalso.enviarCodigoRecuperacaoSenha.mockClear();
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "contas" CASCADE;');
    await criarContaEObterCookie(app, 'aluno@example.com');
  });

  const solicitarCodigo = (email: string) =>
    request(app.getHttpServer()).post('/auth/recuperar-senha').send({ email });

  const redefinirSenha = (codigo: string, novaSenha = 'NovaSenha123!') =>
    request(app.getHttpServer())
      .post('/auth/redefinir-senha')
      .send({ email: 'aluno@example.com', codigo, novaSenha });

  it('deve redefinir a senha com o código recebido por email (sucesso)', async () => {
    const solicitacao = await solicitarCodigo('aluno@example.com');
    expect(solicitacao.status).toBe(204);

    const codigo = obterUltimoCodigoEnviado();
    expect(codigo).toMatch(/^\d{6}$/);

    const redefinicao = await redefinirSenha(codigo);
    expect(redefinicao.status).toBe(204);

    const loginSenhaNova = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'aluno@example.com', senha: 'NovaSenha123!' });
    expect(loginSenhaNova.status).toBe(200);

    const loginSenhaAntiga = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'aluno@example.com', senha: 'SenhaForte123!' });
    expect(loginSenhaAntiga.status).toBe(401);
  });

  it('não deve permitir reutilizar o código depois de usado (falha)', async () => {
    await solicitarCodigo('aluno@example.com');
    const codigo = obterUltimoCodigoEnviado();
    await redefinirSenha(codigo);

    const reuso = await redefinirSenha(codigo, 'OutraSenha123!');

    expect(reuso.status).toBe(400);
  });

  it('deve responder igual e não enviar email quando o email não existe (sucesso)', async () => {
    const resposta = await solicitarCodigo('ninguem@example.com');

    expect(resposta.status).toBe(204);
    expect(emailFalso.enviarCodigoRecuperacaoSenha).not.toHaveBeenCalled();
  });

  it('deve travar o código após 5 tentativas erradas, mesmo com o código certo (falha)', async () => {
    await solicitarCodigo('aluno@example.com');
    const codigoCerto = obterUltimoCodigoEnviado();
    const codigoErrado = codigoCerto === '000000' ? '111111' : '000000';

    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const resposta = await redefinirSenha(codigoErrado);
      expect(resposta.status).toBe(400);
    }

    const comCodigoCerto = await redefinirSenha(codigoCerto);
    expect(comCodigoCerto.status).toBe(400);
  });

  it('não deve reenviar um segundo código dentro do intervalo mínimo (sucesso)', async () => {
    await solicitarCodigo('aluno@example.com');
    const segundaSolicitacao = await solicitarCodigo('aluno@example.com');

    expect(segundaSolicitacao.status).toBe(204);
    expect(emailFalso.enviarCodigoRecuperacaoSenha).toHaveBeenCalledTimes(1);
  });

  it('deve validar o formato do código e da nova senha (falha)', async () => {
    const codigoInvalido = await redefinirSenha('12345');
    expect(codigoInvalido.status).toBe(400);

    const senhaCurta = await redefinirSenha('123456', '123');
    expect(senhaCurta.status).toBe(400);
  });
});
