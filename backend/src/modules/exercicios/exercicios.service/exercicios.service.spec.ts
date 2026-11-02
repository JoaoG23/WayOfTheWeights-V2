import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ExerciciosService } from './exercicios.service';
import { ExerciciosRepositories } from '../exercicios.repositories/exercicios.repositories';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('ExerciciosService', () => {
  let service: ExerciciosService;
  let exerciciosRepositories: jest.Mocked<Partial<ExerciciosRepositories>>;
  let treinosService: jest.Mocked<Partial<TreinosService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };

  const exercicioBase = {
    id: 10,
    treinoId: 5,
    nome: 'Supino reto',
    cargaAtual: 60,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    exerciciosRepositories = {
      buscarPorId: jest.fn(),
      criarComHistorico: jest.fn(),
      atualizarNome: jest.fn(),
      atualizarCargaComHistorico: jest.fn(),
      remover: jest.fn(),
      listarHistoricoCargas: jest.fn(),
    };

    treinosService = {
      buscarPorId: jest.fn().mockResolvedValue({ id: 5, usuarioId: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciciosService,
        { provide: ExerciciosRepositories, useValue: exerciciosRepositories },
        { provide: TreinosService, useValue: treinosService },
      ],
    }).compile();

    service = module.get(ExerciciosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criar', () => {
    it('valida acesso ao treino e cria o exercício gravando histórico', async () => {
      exerciciosRepositories.criarComHistorico!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.criar(usuarioAutenticado, 5, {
        nome: 'Supino reto',
        cargaAtual: 60,
      });

      expect(treinosService.buscarPorId).toHaveBeenCalledWith(
        usuarioAutenticado,
        5,
      );
      expect(exerciciosRepositories.criarComHistorico).toHaveBeenCalledWith({
        treinoId: 5,
        nome: 'Supino reto',
        cargaAtual: 60,
      });
    });
  });

  describe('atualizar', () => {
    it('grava histórico quando a carga muda', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.atualizar(usuarioAutenticado, 5, 10, { cargaAtual: 62.5 });

      expect(
        exerciciosRepositories.atualizarCargaComHistorico,
      ).toHaveBeenCalledWith(10, { nome: undefined, cargaAtual: 62.5 });
      expect(exerciciosRepositories.atualizarNome).not.toHaveBeenCalled();
    });

    it('não grava histórico quando só o nome muda', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(
        exercicioBase as any,
      );

      await service.atualizar(usuarioAutenticado, 5, 10, {
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

      await service.atualizar(usuarioAutenticado, 5, 10, { cargaAtual: 60 });

      expect(
        exerciciosRepositories.atualizarCargaComHistorico,
      ).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando o exercício é de outro treino', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue({
        ...exercicioBase,
        treinoId: 99,
      } as any);

      await expect(
        service.atualizar(usuarioAutenticado, 5, 10, { cargaAtual: 70 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remover', () => {
    it('lança NotFoundException quando o exercício não existe', async () => {
      exerciciosRepositories.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.remover(usuarioAutenticado, 5, 999),
      ).rejects.toThrow(NotFoundException);
      expect(exerciciosRepositories.remover).not.toHaveBeenCalled();
    });
  });
});
