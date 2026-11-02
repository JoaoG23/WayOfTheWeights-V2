import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { ContasService } from './contas.service';
import { ContasRepositories } from '../contas.repositories/contas.repositories';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

describe('ContasService', () => {
  let service: ContasService;
  let contasRepositories: jest.Mocked<Partial<ContasRepositories>>;

  const contaId = 7;

  beforeEach(async () => {
    contasRepositories = {
      buscarPorId: jest.fn(),
      contarUsuariosPorPerfil: jest.fn().mockResolvedValue([]),
      contarUsuariosDoPerfil: jest.fn(),
      atualizarPlano: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContasService,
        { provide: ContasRepositories, useValue: contasRepositories },
      ],
    }).compile();

    service = module.get(ContasService);
  });

  afterEach(() => jest.clearAllMocks());

  function mockarConta(plano: PlanoConta) {
    contasRepositories.buscarPorId!.mockResolvedValue({
      id: contaId,
      plano,
    } as any);
  }

  describe('validarVagaDisponivel', () => {
    it.each([
      PerfilUsuario.ADMINISTRADOR,
      PerfilUsuario.TREINADOR,
      PerfilUsuario.ALUNO,
    ])('plano BASICO bloqueia o 2º usuário com perfil %s', async (perfil) => {
      mockarConta(PlanoConta.BASICO);
      contasRepositories.contarUsuariosDoPerfil!.mockResolvedValue(1);

      await expect(
        service.validarVagaDisponivel(contaId, perfil),
      ).rejects.toThrow(ConflictException);
    });

    it('plano BASICO permite o 1º usuário do perfil', async () => {
      mockarConta(PlanoConta.BASICO);
      contasRepositories.contarUsuariosDoPerfil!.mockResolvedValue(0);

      await expect(
        service.validarVagaDisponivel(contaId, PerfilUsuario.TREINADOR),
      ).resolves.toBeUndefined();
    });

    it('plano BETA permite até 3 usuários do perfil', async () => {
      mockarConta(PlanoConta.BETA);
      contasRepositories.contarUsuariosDoPerfil!.mockResolvedValue(2);

      await expect(
        service.validarVagaDisponivel(contaId, PerfilUsuario.ALUNO),
      ).resolves.toBeUndefined();
    });

    it('plano BETA bloqueia o 4º usuário do perfil', async () => {
      mockarConta(PlanoConta.BETA);
      contasRepositories.contarUsuariosDoPerfil!.mockResolvedValue(3);

      await expect(
        service.validarVagaDisponivel(contaId, PerfilUsuario.ALUNO),
      ).rejects.toThrow(ConflictException);
    });

    it('lança NotFoundException quando a conta não existe', async () => {
      contasRepositories.buscarPorId!.mockResolvedValue(null);

      await expect(
        service.validarVagaDisponivel(contaId, PerfilUsuario.ALUNO),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizarPlano', () => {
    it('bloqueia downgrade para BASICO quando a conta excede os limites', async () => {
      mockarConta(PlanoConta.BETA);
      contasRepositories.contarUsuariosPorPerfil!.mockResolvedValue([
        { perfil: PerfilUsuario.ALUNO, _count: { _all: 2 } },
      ] as any);

      await expect(
        service.atualizarPlano(contaId, PlanoConta.BASICO),
      ).rejects.toThrow(ConflictException);
      expect(contasRepositories.atualizarPlano).not.toHaveBeenCalled();
    });

    it('faz upgrade para BETA e retorna os novos limites', async () => {
      mockarConta(PlanoConta.BASICO);
      contasRepositories.atualizarPlano!.mockImplementation(async () => {
        mockarConta(PlanoConta.BETA);
        return { id: contaId, plano: PlanoConta.BETA } as any;
      });

      const resultado = await service.atualizarPlano(contaId, PlanoConta.BETA);

      expect(contasRepositories.atualizarPlano).toHaveBeenCalledWith(
        contaId,
        PlanoConta.BETA,
      );
      expect(resultado.plano).toBe(PlanoConta.BETA);
      expect(resultado.limites[PerfilUsuario.ALUNO]).toBe(3);
    });
  });

  describe('buscarPlano', () => {
    it('retorna limites do plano e usuários por perfil, com zero nos perfis vazios', async () => {
      mockarConta(PlanoConta.BASICO);
      contasRepositories.contarUsuariosPorPerfil!.mockResolvedValue([
        { perfil: PerfilUsuario.ADMINISTRADOR, _count: { _all: 1 } },
      ] as any);

      const resultado = await service.buscarPlano(contaId);

      expect(resultado.usuariosPorPerfil).toEqual({
        ADMINISTRADOR: 1,
        TREINADOR: 0,
        ALUNO: 0,
      });
      expect(resultado.limites).toEqual({
        ADMINISTRADOR: 1,
        TREINADOR: 1,
        ALUNO: 1,
      });
    });
  });
});
