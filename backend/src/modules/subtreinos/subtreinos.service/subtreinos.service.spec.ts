import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { SubtreinosService } from './subtreinos.service';
import { SubtreinosRepositories } from '../subtreinos.repositories/subtreinos.repositories';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('SubtreinosService', () => {
  let service: SubtreinosService;
  let subtreinosRepositories: jest.Mocked<Partial<SubtreinosRepositories>>;
  let treinosService: jest.Mocked<Partial<TreinosService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };
  const treinoId = 5;
  const subtreinoBase = {
    id: 7,
    treinoId,
    titulo: 'Peito',
    descricao: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  beforeEach(async () => {
    subtreinosRepositories = {
      buscarPorId: jest.fn(),
      contarPorTreino: jest.fn().mockResolvedValue(0),
      listarPorTreino: jest.fn().mockResolvedValue([subtreinoBase]),
      criar: jest.fn().mockResolvedValue(subtreinoBase),
      atualizar: jest.fn().mockResolvedValue(subtreinoBase),
      remover: jest.fn(),
    };
    treinosService = {
      buscarPorId: jest.fn().mockResolvedValue({ id: treinoId, usuarioId: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtreinosService,
        { provide: SubtreinosRepositories, useValue: subtreinosRepositories },
        { provide: TreinosService, useValue: treinosService },
      ],
    }).compile();

    service = module.get(SubtreinosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criar', () => {
    it('valida o acesso ao treino e cria o subtreino', async () => {
      await service.criar(usuarioAutenticado, treinoId, { titulo: 'Peito' });

      expect(treinosService.buscarPorId).toHaveBeenCalledWith(
        usuarioAutenticado,
        treinoId,
      );
      expect(subtreinosRepositories.criar).toHaveBeenCalledWith({
        treinoId,
        titulo: 'Peito',
        descricao: undefined,
      });
    });

    it.each([0, 1, 2])(
      'permite criar quando o treino tem %i subtreinos',
      async (quantidadeAtual) => {
        subtreinosRepositories.contarPorTreino!.mockResolvedValue(
          quantidadeAtual,
        );

        await expect(
          service.criar(usuarioAutenticado, treinoId, { titulo: 'Costas' }),
        ).resolves.toBeDefined();
      },
    );

    it('lança ConflictException ao criar o 4º subtreino', async () => {
      subtreinosRepositories.contarPorTreino!.mockResolvedValue(3);

      await expect(
        service.criar(usuarioAutenticado, treinoId, { titulo: 'Pernas' }),
      ).rejects.toThrow(ConflictException);
      expect(subtreinosRepositories.criar).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('lança NotFoundException quando o subtreino é de outro treino', async () => {
      subtreinosRepositories.buscarPorId!.mockResolvedValue({
        ...subtreinoBase,
        treinoId: 999,
      } as any);

      await expect(
        service.buscarPorId(usuarioAutenticado, treinoId, subtreinoBase.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException quando o subtreino não existe', async () => {
      subtreinosRepositories.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.buscarPorId(usuarioAutenticado, treinoId, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizar e remover', () => {
    it('atualiza título e descrição do subtreino do treino', async () => {
      subtreinosRepositories.buscarPorId!.mockResolvedValue(
        subtreinoBase as any,
      );

      await service.atualizar(usuarioAutenticado, treinoId, subtreinoBase.id, {
        titulo: 'Peito e Tríceps',
      });

      expect(subtreinosRepositories.atualizar).toHaveBeenCalledWith(
        subtreinoBase.id,
        { titulo: 'Peito e Tríceps', descricao: undefined },
      );
    });

    it('remove o subtreino do treino', async () => {
      subtreinosRepositories.buscarPorId!.mockResolvedValue(
        subtreinoBase as any,
      );

      await service.remover(usuarioAutenticado, treinoId, subtreinoBase.id);

      expect(subtreinosRepositories.remover).toHaveBeenCalledWith(
        subtreinoBase.id,
      );
    });
  });
});
