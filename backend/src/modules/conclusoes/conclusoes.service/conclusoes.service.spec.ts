import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { ConclusoesService } from './conclusoes.service';
import { ConclusoesRepositories } from '../conclusoes.repositories/conclusoes.repositories';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { SubtreinosService } from '../../subtreinos/subtreinos.service/subtreinos.service';
import { ExerciciosService } from '../../exercicios/exercicios.service/exercicios.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('ConclusoesService', () => {
  let service: ConclusoesService;
  let conclusoesRepositories: jest.Mocked<Partial<ConclusoesRepositories>>;
  let treinosService: jest.Mocked<Partial<TreinosService>>;
  let subtreinosService: jest.Mocked<Partial<SubtreinosService>>;
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
  const exerciciosDoSubtreino = [
    { id: 10, nome: 'Desenvolvimento', cargaAtual: 20 },
    { id: 11, nome: 'Elevação lateral', cargaAtual: 8 },
  ];
  const conclusaoPersistida = {
    id: 1,
    usuarioId: 1,
    subtreinoId,
    tituloTreino: 'Treino 1',
    tituloSubtreino: 'Ombros',
    concluidoEm: new Date('2026-11-06T18:00:00Z'),
    exercicios: [
      { nome: 'Desenvolvimento', cargaKg: 20 },
      { nome: 'Elevação lateral', cargaKg: 8 },
    ],
  };

  beforeEach(async () => {
    conclusoesRepositories = {
      criar: jest.fn().mockResolvedValue(conclusaoPersistida),
      listarPorUsuarioNaConta: jest.fn().mockResolvedValue([conclusaoPersistida]),
    };
    treinosService = {
      buscarPorId: jest
        .fn()
        .mockResolvedValue({ id: treinoId, usuarioId: 1, titulo: 'Treino 1' }),
    };
    subtreinosService = {
      buscarPorId: jest
        .fn()
        .mockResolvedValue({ id: subtreinoId, titulo: 'Ombros' }),
    };
    exerciciosService = {
      listarPorSubtreino: jest.fn().mockResolvedValue(exerciciosDoSubtreino),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConclusoesService,
        { provide: ConclusoesRepositories, useValue: conclusoesRepositories },
        { provide: TreinosService, useValue: treinosService },
        { provide: SubtreinosService, useValue: subtreinosService },
        { provide: ExerciciosService, useValue: exerciciosService },
      ],
    }).compile();

    service = module.get(ConclusoesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criar', () => {
    it('registra a conclusão quando todos os exercícios estão marcados', async () => {
      const resposta = await service.criar(
        usuarioAutenticado,
        treinoId,
        subtreinoId,
        { exerciciosConcluidosIds: [11, 10] },
      );

      expect(conclusoesRepositories.criar).toHaveBeenCalledWith({
        usuarioId: 1,
        subtreinoId,
        tituloTreino: 'Treino 1',
        tituloSubtreino: 'Ombros',
        exercicios: [
          { nome: 'Desenvolvimento', cargaKg: 20 },
          { nome: 'Elevação lateral', cargaKg: 8 },
        ],
      });
      expect(resposta.exercicios).toEqual([
        { nome: 'Desenvolvimento', cargaAtual: 20 },
        { nome: 'Elevação lateral', cargaAtual: 8 },
      ]);
    });

    it('rejeita quando falta marcar algum exercício', async () => {
      await expect(
        service.criar(usuarioAutenticado, treinoId, subtreinoId, {
          exerciciosConcluidosIds: [10],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(conclusoesRepositories.criar).not.toHaveBeenCalled();
    });

    it('rejeita ids que não são do subtreino', async () => {
      await expect(
        service.criar(usuarioAutenticado, treinoId, subtreinoId, {
          exerciciosConcluidosIds: [10, 11, 999],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(conclusoesRepositories.criar).not.toHaveBeenCalled();
    });

    it('rejeita subtreino sem exercícios', async () => {
      exerciciosService.listarPorSubtreino!.mockResolvedValue([]);

      await expect(
        service.criar(usuarioAutenticado, treinoId, subtreinoId, {
          exerciciosConcluidosIds: [10],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('valida o acesso ao treino antes de gravar', async () => {
      treinosService.buscarPorId!.mockRejectedValue(new Error('sem acesso'));

      await expect(
        service.criar(usuarioAutenticado, treinoId, subtreinoId, {
          exerciciosConcluidosIds: [10, 11],
        }),
      ).rejects.toThrow('sem acesso');
      expect(conclusoesRepositories.criar).not.toHaveBeenCalled();
    });
  });

  describe('listar', () => {
    it('aluno lista só as próprias conclusões, restritas à conta', async () => {
      await service.listar(usuarioAutenticado, {
        usuarioId: 99,
        inicio: '2026-11-02T00:00:00.000Z',
        fim: '2026-11-09T00:00:00.000Z',
      });

      expect(
        conclusoesRepositories.listarPorUsuarioNaConta,
      ).toHaveBeenCalledWith(1, 1, {
        inicio: new Date('2026-11-02T00:00:00.000Z'),
        fim: new Date('2026-11-09T00:00:00.000Z'),
      });
    });

    it('administrador pode listar as conclusões de outro usuário da conta', async () => {
      await service.listar(
        { ...usuarioAutenticado, perfil: PerfilUsuario.ADMINISTRADOR },
        { usuarioId: 3 },
      );

      expect(
        conclusoesRepositories.listarPorUsuarioNaConta,
      ).toHaveBeenCalledWith(1, 3, { inicio: undefined, fim: undefined });
    });
  });
});
