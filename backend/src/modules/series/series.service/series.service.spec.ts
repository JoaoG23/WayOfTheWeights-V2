import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { SeriesService } from './series.service';
import { SeriesRepositories } from '../series.repositories/series.repositories';
import { ExerciciosService } from '../../exercicios/exercicios.service/exercicios.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('SeriesService', () => {
  let service: SeriesService;
  let seriesRepositories: jest.Mocked<Partial<SeriesRepositories>>;
  let exerciciosService: jest.Mocked<Partial<ExerciciosService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };
  const treinoId = 5;
  const subtreinoId = 7;
  const exercicioId = 10;
  const serieBase = {
    id: 100,
    exercicioId,
    repeticoes: 12,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    seriesRepositories = {
      buscarPorId: jest.fn(),
      listarPorExercicio: jest.fn().mockResolvedValue([serieBase]),
      criar: jest.fn().mockResolvedValue(serieBase),
      atualizarRepeticoes: jest.fn().mockResolvedValue(serieBase),
      remover: jest.fn(),
    };
    exerciciosService = {
      buscarPorId: jest.fn().mockResolvedValue({ id: exercicioId }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        { provide: SeriesRepositories, useValue: seriesRepositories },
        { provide: ExerciciosService, useValue: exerciciosService },
      ],
    }).compile();

    service = module.get(SeriesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criar', () => {
    it('valida o acesso ao exercício e cria a série', async () => {
      await service.criar(usuarioAutenticado, treinoId, subtreinoId, exercicioId, {
        repeticoes: 12,
      });

      expect(exerciciosService.buscarPorId).toHaveBeenCalledWith(
        usuarioAutenticado,
        treinoId,
        subtreinoId,
        exercicioId,
      );
      expect(seriesRepositories.criar).toHaveBeenCalledWith({
        exercicioId,
        repeticoes: 12,
      });
    });

    it('não cria quando o exercício não é acessível ao usuário', async () => {
      exerciciosService.buscarPorId!.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.criar(usuarioAutenticado, treinoId, subtreinoId, exercicioId, {
          repeticoes: 12,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(seriesRepositories.criar).not.toHaveBeenCalled();
    });
  });

  describe('listarPorExercicio', () => {
    it('lista as séries do exercício', async () => {
      const series = await service.listarPorExercicio(
        usuarioAutenticado,
        treinoId,
        subtreinoId,
        exercicioId,
      );

      expect(series).toEqual([serieBase]);
      expect(seriesRepositories.listarPorExercicio).toHaveBeenCalledWith(
        exercicioId,
      );
    });
  });

  describe('atualizar', () => {
    it('atualiza as repetições da série do exercício', async () => {
      seriesRepositories.buscarPorId!.mockResolvedValue(serieBase as any);

      await service.atualizar(
        usuarioAutenticado,
        treinoId,
        subtreinoId,
        exercicioId,
        serieBase.id,
        { repeticoes: 10 },
      );

      expect(seriesRepositories.atualizarRepeticoes).toHaveBeenCalledWith(
        serieBase.id,
        10,
      );
    });

    it('lança NotFoundException quando a série é de outro exercício', async () => {
      seriesRepositories.buscarPorId!.mockResolvedValue({
        ...serieBase,
        exercicioId: 999,
      } as any);

      await expect(
        service.atualizar(usuarioAutenticado, treinoId, subtreinoId, exercicioId, 100, {
          repeticoes: 10,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(seriesRepositories.atualizarRepeticoes).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    it('lança NotFoundException quando a série não existe', async () => {
      seriesRepositories.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.remover(usuarioAutenticado, treinoId, subtreinoId, exercicioId, 999),
      ).rejects.toThrow(NotFoundException);
      expect(seriesRepositories.remover).not.toHaveBeenCalled();
    });

    it('remove a série do exercício', async () => {
      seriesRepositories.buscarPorId!.mockResolvedValue(serieBase as any);

      await service.remover(usuarioAutenticado, treinoId, subtreinoId, exercicioId, 100);

      expect(seriesRepositories.remover).toHaveBeenCalledWith(100);
    });
  });
});
