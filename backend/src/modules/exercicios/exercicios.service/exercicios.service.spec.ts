import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ExerciciosService } from './exercicios.service';
import { ExerciciosRepositories } from '../exercicios.repositories/exercicios.repositories';
import { SubtreinosService } from '../../subtreinos/subtreinos.service/subtreinos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('ExerciciosService', () => {
  let service: ExerciciosService;
  let exerciciosRepositories: jest.Mocked<Partial<ExerciciosRepositories>>;
  let subtreinosService: jest.Mocked<Partial<SubtreinosService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };

  // Formato devolvido pelo repositório: carga vem do catálogo compartilhado.
  const exercicioBase = {
    id: 10,
    subtreinoId: 7,
    nome: 'Supino reto',
    cargaId: 60,
    carga: { valor: 60 },
    series: [{ repeticoes: 12 }, { repeticoes: 10 }],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    exerciciosRepositories = {
      buscarPorId: jest.fn(),
      criarComHistorico: jest.fn().mockResolvedValue(exercicioBase),
      atualizarNome: jest.fn().mockResolvedValue(exercicioBase),
      atualizarCargaComHistorico: jest.fn().mockResolvedValue(exercicioBase),
      remover: jest.fn(),
      listarHistoricoCargas: jest.fn(),
    };

    subtreinosService = {
      buscarPorId: jest.fn().mockResolvedValue({ id: 5, usuarioId: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciciosService,
        { provide: ExerciciosRepositories, useValue: exerciciosRepositories },
        { provide: SubtreinosService, useValue: subtreinosService },
      ],
    }).compile();

    service = module.get(ExerciciosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criar', () => {
    it('valida acesso ao treino e cria o exercício gravando histórico', async () => {
      const resultado = await service.criar(usuarioAutenticado, 5, 7, {
        nome: 'Supino reto',
        cargaAtual: 60,
      });

      expect(subtreinosService.buscarPorId).toHaveBeenCalledWith(
        usuarioAutenticado,
        5,
        7,
      );
      expect(exerciciosRepositories.criarComHistorico).toHaveBeenCalledWith({
        subtreinoId: 7,
        nome: 'Supino reto',
        cargaAtual: 60,
      });
      // A resposta expõe a carga como número, não o registro do catálogo.
      expect(resultado.cargaAtual).toBe(60);
      expect(resultado.repeticoesPorSerie).toEqual([12, 10]);
      expect(resultado).not.toHaveProperty('carga');
    });
  });

  describe('listarHistoricoCargas', () => {
    it('devolve cada registro com a carga em kg', async () => {
      const registradoEm = new Date();
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );
      exerciciosRepositories.listarHistoricoCargas!.mockResolvedValue([
        { id: 1, registradoEm, carga: { valor: 60 } },
      ] as any);

      const historico = await service.listarHistoricoCargas(
        usuarioAutenticado,
        5,
        7,
        10,
      );

      expect(historico).toEqual([{ id: 1, carga: 60, registradoEm }]);
    });
  });

  describe('atualizar', () => {
    it('grava histórico quando a carga muda', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.atualizar(usuarioAutenticado, 5, 7, 10, { cargaAtual: 62 });

      expect(
        exerciciosRepositories.atualizarCargaComHistorico,
      ).toHaveBeenCalledWith(10, { nome: undefined, cargaAtual: 62 });
      expect(exerciciosRepositories.atualizarNome).not.toHaveBeenCalled();
    });

    it('não grava histórico quando só o nome muda', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.atualizar(usuarioAutenticado, 5, 7, 10, {
        nome: 'Supino inclinado',
      });

      expect(exerciciosRepositories.atualizarNome).toHaveBeenCalledWith(
        10,
        'Supino inclinado',
      );
      expect(
        exerciciosRepositories.atualizarCargaComHistorico,
      ).not.toHaveBeenCalled();
    });

    it('não grava histórico quando a carga enviada é igual à atual', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.atualizar(usuarioAutenticado, 5, 7, 10, { cargaAtual: 60 });

      expect(
        exerciciosRepositories.atualizarCargaComHistorico,
      ).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o exercício é de outro subtreino', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue({
        ...exercicioBase,
        subtreinoId: 99,
      } as any);

      await expect(
        service.atualizar(usuarioAutenticado, 5, 7, 10, { cargaAtual: 70 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remover', () => {
    it('lança NotFoundException quando o exercício não existe', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.remover(usuarioAutenticado, 5, 7, 999),
      ).rejects.toThrow(NotFoundException);
      expect(exerciciosRepositories.remover).not.toHaveBeenCalled();
    });
  });
});
