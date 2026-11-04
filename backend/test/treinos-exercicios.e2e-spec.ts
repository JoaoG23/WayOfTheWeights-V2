import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { configurarAplicacao } from './../src/app.configuracao';
import {
  criarContaEObterCookie,
  criarUsuarioNaContaEObterCookie,
} from './helpers/autenticacao';

describe('Treinos, exercícios e estatísticas (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookieAdministrador: string;
  let cookieAluno: string;
  let usuarioIdAluno: number;

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
    const conta = await criarContaEObterCookie(app);
    cookieAdministrador = conta.cookie;

    const aluno = await criarUsuarioNaContaEObterCookie(
      app,
      cookieAdministrador,
      'ALUNO',
      'aluno@example.com',
    );
    cookieAluno = aluno.cookie;
    usuarioIdAluno = aluno.usuarioId;
  });

  async function criarTreinoComExercicio(cookie: string) {
    const treino = await request(app.getHttpServer())
      .post('/treinos')
      .set('Cookie', cookie)
      .send({ titulo: 'Treino A' });

    const exercicio = await request(app.getHttpServer())
      .post(`/treinos/${treino.body.id}/exercicios`)
      .set('Cookie', cookie)
      .send({ nome: 'Supino reto', cargaAtual: 40 });

    return { treinoId: treino.body.id, exercicioId: exercicio.body.id };
  }

  describe('conta e plano', () => {
    it('autocadastro deve criar conta BASICO com administrador proprietário (sucesso)', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/conta')
        .send({
          nome: 'Novo Dono',
          email: 'novo-dono@example.com',
          senha: 'SenhaForte123!',
          perfil: 'ALUNO',
        });

      expect(resposta.status).toBe(201);
      expect(resposta.body.perfil).toBe('ADMINISTRADOR');
      expect(resposta.body.proprietario).toBe(true);
      expect(resposta.body).not.toHaveProperty('senhaHash');
    });

    it('plano BASICO deve bloquear o 2º aluno e liberar após upgrade para BETA', async () => {
      const segundoAluno = {
        nome: 'Segundo Aluno',
        email: 'aluno2@example.com',
        senha: 'SenhaForte123!',
        perfil: 'ALUNO',
      };

      const bloqueado = await request(app.getHttpServer())
        .post('/usuarios')
        .set('Cookie', cookieAdministrador)
        .send(segundoAluno);
      expect(bloqueado.status).toBe(409);

      const upgrade = await request(app.getHttpServer())
        .put('/conta/plano')
        .set('Cookie', cookieAdministrador)
        .send({ plano: 'BETA' });
      expect(upgrade.status).toBe(200);
      expect(upgrade.body.limites.ALUNO).toBe(3);

      const liberado = await request(app.getHttpServer())
        .post('/usuarios')
        .set('Cookie', cookieAdministrador)
        .send(segundoAluno);
      expect(liberado.status).toBe(201);

      const downgrade = await request(app.getHttpServer())
        .put('/conta/plano')
        .set('Cookie', cookieAdministrador)
        .send({ plano: 'BASICO' });
      expect(downgrade.status).toBe(409);
    });

    it('deve informar o plano e os usuários por perfil (sucesso)', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/conta/plano')
        .set('Cookie', cookieAluno);

      expect(resposta.status).toBe(200);
      expect(resposta.body.plano).toBe('BASICO');
      expect(resposta.body.usuariosPorPerfil).toEqual({
        ADMINISTRADOR: 1,
        TREINADOR: 0,
        ALUNO: 1,
      });
    });

    it('aluno não deve alterar o plano nem gerenciar usuários (falha)', async () => {
      const plano = await request(app.getHttpServer())
        .put('/conta/plano')
        .set('Cookie', cookieAluno)
        .send({ plano: 'BETA' });
      expect(plano.status).toBe(403);

      const usuarios = await request(app.getHttpServer())
        .get('/usuarios')
        .set('Cookie', cookieAluno);
      expect(usuarios.status).toBe(403);
    });
  });

  describe('evolução de carga', () => {
    it('deve gravar histórico na criação e a cada alteração de carga (sucesso)', async () => {
      const { treinoId, exercicioId } =
        await criarTreinoComExercicio(cookieAluno);
      const rotaExercicio = `/treinos/${treinoId}/exercicios/${exercicioId}`;

      await request(app.getHttpServer())
        .put(rotaExercicio)
        .set('Cookie', cookieAluno)
        .send({ cargaAtual: 50 });
      await request(app.getHttpServer())
        .put(rotaExercicio)
        .set('Cookie', cookieAluno)
        .send({ nome: 'Supino reto barra' });

      const historico = await request(app.getHttpServer())
        .get(`${rotaExercicio}/historico`)
        .set('Cookie', cookieAluno);

      expect(historico.status).toBe(200);
      expect(historico.body.map((registro) => registro.carga)).toEqual([
        40, 50,
      ]);
    });

    it('deve recusar carga fracionada ou fora do catálogo de 1 a 1500 kg (falha)', async () => {
      const { treinoId, exercicioId } =
        await criarTreinoComExercicio(cookieAluno);
      const rotaExercicio = `/treinos/${treinoId}/exercicios/${exercicioId}`;

      for (const cargaInvalida of [42.5, 0, 1501]) {
        const resposta = await request(app.getHttpServer())
          .put(rotaExercicio)
          .set('Cookie', cookieAluno)
          .send({ cargaAtual: cargaInvalida });
        expect(resposta.status).toBe(400);
      }

      const cargaMaxima = await request(app.getHttpServer())
        .put(rotaExercicio)
        .set('Cookie', cookieAluno)
        .send({ cargaAtual: 1500 });
      expect(cargaMaxima.status).toBe(200);
      expect(cargaMaxima.body.cargaAtual).toBe(1500);
    });

    it('deve calcular o resumo de evolução de força (sucesso)', async () => {
      const { treinoId, exercicioId } =
        await criarTreinoComExercicio(cookieAluno);
      await request(app.getHttpServer())
        .put(`/treinos/${treinoId}/exercicios/${exercicioId}`)
        .set('Cookie', cookieAluno)
        .send({ cargaAtual: 50 });

      const resposta = await request(app.getHttpServer())
        .get('/estatisticas/resumo')
        .set('Cookie', cookieAluno);

      expect(resposta.status).toBe(200);
      expect(resposta.body[0]).toMatchObject({
        exercicioId,
        cargaInicial: 40,
        cargaAtual: 50,
        evolucaoCarga: 10,
        evolucaoPercentual: 25,
        quantidadeRegistros: 2,
      });
    });
  });

  describe('acesso por perfil e por conta', () => {
    it('treinador deve criar e listar treinos de um aluno da conta (sucesso)', async () => {
      const treinador = await criarUsuarioNaContaEObterCookie(
        app,
        cookieAdministrador,
        'TREINADOR',
        'treinador@example.com',
      );

      const treinoCriado = await request(app.getHttpServer())
        .post('/treinos')
        .set('Cookie', treinador.cookie)
        .send({ titulo: 'Treino do aluno', usuarioId: usuarioIdAluno });
      expect(treinoCriado.status).toBe(201);
      expect(treinoCriado.body.usuarioId).toBe(usuarioIdAluno);

      const treinosDoAluno = await request(app.getHttpServer())
        .get(`/treinos?usuarioId=${usuarioIdAluno}`)
        .set('Cookie', treinador.cookie);
      expect(treinosDoAluno.body).toHaveLength(1);
    });

    it('administrador deve acessar o treino de um aluno da conta (sucesso)', async () => {
      const { treinoId } = await criarTreinoComExercicio(cookieAluno);

      const resposta = await request(app.getHttpServer())
        .get(`/treinos/${treinoId}`)
        .set('Cookie', cookieAdministrador);

      expect(resposta.status).toBe(200);
    });

    it('administrador de outra conta não deve acessar treinos nem usuários desta conta (falha)', async () => {
      const { treinoId } = await criarTreinoComExercicio(cookieAluno);
      const outraConta = await criarContaEObterCookie(
        app,
        'admin-outra-conta@example.com',
      );

      const treino = await request(app.getHttpServer())
        .get(`/treinos/${treinoId}`)
        .set('Cookie', outraConta.cookie);
      expect(treino.status).toBe(404);

      const usuario = await request(app.getHttpServer())
        .get(`/usuarios/${usuarioIdAluno}`)
        .set('Cookie', outraConta.cookie);
      expect(usuario.status).toBe(404);

      const treinoParaOutraConta = await request(app.getHttpServer())
        .post('/treinos')
        .set('Cookie', outraConta.cookie)
        .send({ titulo: 'Invasão', usuarioId: usuarioIdAluno });
      expect(treinoParaOutraConta.status).toBe(404);
    });

    it('aluno não deve acessar o treino de outro aluno da mesma conta (falha)', async () => {
      await request(app.getHttpServer())
        .put('/conta/plano')
        .set('Cookie', cookieAdministrador)
        .send({ plano: 'BETA' });
      const outroAluno = await criarUsuarioNaContaEObterCookie(
        app,
        cookieAdministrador,
        'ALUNO',
        'outro-aluno@example.com',
      );
      const { treinoId } = await criarTreinoComExercicio(cookieAluno);

      const resposta = await request(app.getHttpServer())
        .get(`/treinos/${treinoId}`)
        .set('Cookie', outroAluno.cookie);

      expect(resposta.status).toBe(404);
    });
  });
});
