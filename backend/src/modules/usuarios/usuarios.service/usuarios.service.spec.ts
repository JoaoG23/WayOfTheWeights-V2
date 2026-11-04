import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service';
import { UsuariosRepositories } from '../usuarios.repositories/usuarios.repositories';
import { CriptografiaBcryptService } from '../../../shared/criptografia/criptografia-bcrypt.service';
import { ContasService } from '../../contas/contas.service/contas.service';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuariosRepositories: jest.Mocked<Partial<UsuariosRepositories>>;
  let criptografiaBcrypt: jest.Mocked<Partial<CriptografiaBcryptService>>;
  let contasService: jest.Mocked<Partial<ContasService>>;

  const contaId = 7;
  const usuarioBase = {
    id: 1,
    contaId,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    senhaHash: 'hash-existente',
    perfil: PerfilUsuario.ALUNO,
    ativo: true,
    proprietario: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };
  const proprietario = {
    ...usuarioBase,
    perfil: PerfilUsuario.ADMINISTRADOR,
    proprietario: true,
  };

  beforeEach(async () => {
    usuariosRepositories = {
      buscarPorEmail: jest.fn(),
      buscarPorIdNaConta: jest.fn(),
      listarTodosDaConta: jest.fn(),
      criar: jest.fn(),
      criarComNovaConta: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    };

    criptografiaBcrypt = {
      criptografarSenha: jest.fn().mockResolvedValue('hash-nova'),
      verificarSenhasCombinam: jest.fn(),
    };

    contasService = {
      validarVagaDisponivel: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: UsuariosRepositories, useValue: usuariosRepositories },
        { provide: CriptografiaBcryptService, useValue: criptografiaBcrypt },
        { provide: ContasService, useValue: contasService },
      ],
    }).compile();

    service = module.get(UsuariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('criarConta', () => {
    it('cria conta BASICO com quem se cadastrou como administrador proprietário', async () => {
      usuariosRepositories.buscarPorEmail!.mockResolvedValue(null);
      usuariosRepositories.criarComNovaConta!.mockResolvedValue(
        proprietario as any,
      );

      const resultado = await service.criarConta({
        nome: 'Dono',
        email: 'dono@teste.com',
        senha: 'senha123',
      });

      expect(usuariosRepositories.criarComNovaConta).toHaveBeenCalledWith(
        {
          nome: 'Dono',
          email: 'dono@teste.com',
          senhaHash: 'hash-nova',
          perfil: PerfilUsuario.ADMINISTRADOR,
          proprietario: true,
        },
        PlanoConta.BASICO,
      );
      expect(resultado).not.toHaveProperty('senhaHash');
    });

    it('lança ConflictException quando o email já existe', async () => {
      usuariosRepositories.buscarPorEmail!.mockResolvedValue(
        usuarioBase as any,
      );

      await expect(
        service.criarConta({
          nome: 'Dono',
          email: usuarioBase.email,
          senha: 'senha123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('criar', () => {
    it('valida a vaga do perfil no plano e cria o usuário na conta', async () => {
      usuariosRepositories.buscarPorEmail!.mockResolvedValue(null);
      usuariosRepositories.criar!.mockResolvedValue(usuarioBase as any);

      await service.criar(contaId, {
        nome: usuarioBase.nome,
        email: usuarioBase.email,
        senha: 'senha123',
        perfil: PerfilUsuario.ALUNO,
      });

      expect(contasService.validarVagaDisponivel).toHaveBeenCalledWith(
        contaId,
        PerfilUsuario.ALUNO,
      );
      expect(usuariosRepositories.criar).toHaveBeenCalledWith({
        contaId,
        nome: usuarioBase.nome,
        email: usuarioBase.email,
        senhaHash: 'hash-nova',
        perfil: PerfilUsuario.ALUNO,
        proprietario: false,
      });
    });

    it('não cria quando o plano não tem vaga para o perfil', async () => {
      usuariosRepositories.buscarPorEmail!.mockResolvedValue(null);
      contasService.validarVagaDisponivel!.mockRejectedValue(
        new ConflictException('limite'),
      );

      await expect(
        service.criar(contaId, {
          nome: usuarioBase.nome,
          email: usuarioBase.email,
          senha: 'senha123',
          perfil: PerfilUsuario.ALUNO,
        }),
      ).rejects.toThrow(ConflictException);
      expect(usuariosRepositories.criar).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('lança NotFoundException quando o usuário não é da conta', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(null);

      await expect(service.buscarPorId(contaId, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna o usuário sem senhaHash quando encontrado', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );

      const resultado = await service.buscarPorId(contaId, usuarioBase.id);

      expect(resultado.id).toBe(usuarioBase.id);
      expect(resultado).not.toHaveProperty('senhaHash');
    });
  });

  describe('atualizar', () => {
    it('valida a vaga no plano quando o perfil muda', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      usuariosRepositories.atualizar!.mockResolvedValue(usuarioBase as any);

      await service.atualizar(contaId, usuarioBase.id, {
        perfil: PerfilUsuario.TREINADOR,
      });

      expect(contasService.validarVagaDisponivel).toHaveBeenCalledWith(
        contaId,
        PerfilUsuario.TREINADOR,
      );
    });

    it('não valida vaga quando o perfil enviado é o mesmo', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      usuariosRepositories.atualizar!.mockResolvedValue(usuarioBase as any);

      await service.atualizar(contaId, usuarioBase.id, {
        perfil: PerfilUsuario.ALUNO,
      });

      expect(contasService.validarVagaDisponivel).not.toHaveBeenCalled();
    });

    it('lança ConflictException ao alterar o perfil do proprietário', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        proprietario as any,
      );

      await expect(
        service.atualizar(contaId, proprietario.id, {
          perfil: PerfilUsuario.ALUNO,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('lança ConflictException ao desativar o proprietário', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        proprietario as any,
      );

      await expect(
        service.atualizar(contaId, proprietario.id, { ativo: false }),
      ).rejects.toThrow(ConflictException);
    });

    it('lança ConflictException quando o novo email já pertence a outro usuário', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      usuariosRepositories.buscarPorEmail!.mockResolvedValue({
        ...usuarioBase,
        id: 2,
      } as any);

      await expect(
        service.atualizar(contaId, usuarioBase.id, {
          email: 'novo@teste.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('atualiza sem recriptografar quando a senha não é informada', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      usuariosRepositories.atualizar!.mockResolvedValue(usuarioBase as any);

      await service.atualizar(contaId, usuarioBase.id, { ativo: false });

      expect(criptografiaBcrypt.criptografarSenha).not.toHaveBeenCalled();
      expect(usuariosRepositories.atualizar).toHaveBeenCalledWith(
        usuarioBase.id,
        {
          nome: undefined,
          email: undefined,
          senhaHash: undefined,
          perfil: undefined,
          ativo: false,
        },
      );
    });
  });

  describe('trocarSenha', () => {
    it('grava o hash da nova senha quando a senha atual confere', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      criptografiaBcrypt.verificarSenhasCombinam!.mockResolvedValue(true);

      await service.trocarSenha(contaId, usuarioBase.id, {
        senhaAtual: 'senha-atual',
        novaSenha: 'senha-nova',
      });

      expect(criptografiaBcrypt.verificarSenhasCombinam).toHaveBeenCalledWith(
        'senha-atual',
        usuarioBase.senhaHash,
      );
      expect(usuariosRepositories.atualizar).toHaveBeenCalledWith(
        usuarioBase.id,
        { senhaHash: 'hash-nova' },
      );
    });

    it('lança BadRequestException e não altera quando a senha atual está errada', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );
      criptografiaBcrypt.verificarSenhasCombinam!.mockResolvedValue(false);

      await expect(
        service.trocarSenha(contaId, usuarioBase.id, {
          senhaAtual: 'errada',
          novaSenha: 'senha-nova',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(usuariosRepositories.atualizar).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    it('lança NotFoundException quando o usuário não é da conta', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(null);

      await expect(service.remover(contaId, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança ConflictException ao tentar remover o proprietário', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        proprietario as any,
      );

      await expect(service.remover(contaId, proprietario.id)).rejects.toThrow(
        ConflictException,
      );
      expect(usuariosRepositories.remover).not.toHaveBeenCalled();
    });

    it('remove o usuário quando ele existe na conta', async () => {
      usuariosRepositories.buscarPorIdNaConta!.mockResolvedValue(
        usuarioBase as any,
      );

      await service.remover(contaId, usuarioBase.id);

      expect(usuariosRepositories.remover).toHaveBeenCalledWith(
        usuarioBase.id,
      );
    });
  });
});
