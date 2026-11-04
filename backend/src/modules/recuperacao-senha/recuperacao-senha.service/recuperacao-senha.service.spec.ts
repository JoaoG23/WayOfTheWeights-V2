import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { RecuperacaoSenhaRepositories } from '../recuperacao-senha.repositories/recuperacao-senha.repositories';
import { CriptografiaBcryptService } from '../../../shared/criptografia/criptografia-bcrypt.service';
import { EmailService } from '../../../shared/email/email.service';

describe('RecuperacaoSenhaService', () => {
  let service: RecuperacaoSenhaService;
  let repositories: jest.Mocked<Partial<RecuperacaoSenhaRepositories>>;
  let criptografiaBcrypt: jest.Mocked<Partial<CriptografiaBcryptService>>;
  let emailService: jest.Mocked<Partial<EmailService>>;

  const usuarioBase = {
    id: 1,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    ativo: true,
  };
  const umMinutoEmMs = 60 * 1000;
  const codigoSalvoBase = {
    usuarioId: 1,
    codigoHash: 'hash-do-codigo',
    expiraEm: new Date(Date.now() + 10 * umMinutoEmMs),
    tentativas: 0,
    criadoEm: new Date(Date.now() - 5 * umMinutoEmMs),
  };

  beforeEach(async () => {
    repositories = {
      buscarUsuarioPorEmail: jest.fn().mockResolvedValue(usuarioBase),
      buscarCodigoDoUsuario: jest.fn().mockResolvedValue(null),
      salvarCodigo: jest.fn(),
      registrarTentativaErrada: jest.fn(),
      redefinirSenhaEApagarCodigo: jest.fn(),
    };
    criptografiaBcrypt = {
      criptografarSenha: jest.fn().mockResolvedValue('hash-novo'),
      verificarSenhasCombinam: jest.fn(),
    };
    emailService = {
      enviarCodigoRecuperacaoSenha: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecuperacaoSenhaService,
        { provide: RecuperacaoSenhaRepositories, useValue: repositories },
        { provide: CriptografiaBcryptService, useValue: criptografiaBcrypt },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(RecuperacaoSenhaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('solicitarCodigo', () => {
    it('gera código de 6 dígitos, guarda só o hash e envia o código por email', async () => {
      await service.solicitarCodigo({ email: usuarioBase.email });

      const codigoEnviado = emailService.enviarCodigoRecuperacaoSenha!.mock
        .calls[0][2];
      expect(codigoEnviado).toMatch(/^\d{6}$/);
      expect(criptografiaBcrypt.criptografarSenha).toHaveBeenCalledWith(
        codigoEnviado,
      );
      expect(repositories.salvarCodigo).toHaveBeenCalledWith(
        usuarioBase.id,
        'hash-novo',
        expect.any(Date),
      );
      expect(emailService.enviarCodigoRecuperacaoSenha).toHaveBeenCalledWith(
        usuarioBase.email,
        usuarioBase.nome,
        codigoEnviado,
        15,
      );
    });

    it('não faz nada (e não falha) quando o email não está cadastrado', async () => {
      repositories.buscarUsuarioPorEmail!.mockResolvedValue(null);

      await expect(
        service.solicitarCodigo({ email: 'ninguem@teste.com' }),
      ).resolves.toBeUndefined();
      expect(repositories.salvarCodigo).not.toHaveBeenCalled();
      expect(emailService.enviarCodigoRecuperacaoSenha).not.toHaveBeenCalled();
    });

    it('não envia código para usuário inativo', async () => {
      repositories.buscarUsuarioPorEmail!.mockResolvedValue({
        ...usuarioBase,
        ativo: false,
      } as any);

      await service.solicitarCodigo({ email: usuarioBase.email });

      expect(emailService.enviarCodigoRecuperacaoSenha).not.toHaveBeenCalled();
    });

    it('não reenvia dentro do intervalo mínimo entre envios', async () => {
      repositories.buscarCodigoDoUsuario!.mockResolvedValue({
        ...codigoSalvoBase,
        criadoEm: new Date(Date.now() - 10 * 1000),
      } as any);

      await service.solicitarCodigo({ email: usuarioBase.email });

      expect(repositories.salvarCodigo).not.toHaveBeenCalled();
      expect(emailService.enviarCodigoRecuperacaoSenha).not.toHaveBeenCalled();
    });

    it('não propaga a falha do servidor SMTP', async () => {
      emailService.enviarCodigoRecuperacaoSenha!.mockRejectedValue(
        new Error('SMTP indisponível'),
      );

      await expect(
        service.solicitarCodigo({ email: usuarioBase.email }),
      ).resolves.toBeUndefined();
    });
  });

  describe('redefinirSenha', () => {
    const dadosRedefinicao = {
      email: usuarioBase.email,
      codigo: '123456',
      novaSenha: 'NovaSenha123!',
    };

    it('troca a senha e consome o código quando o código confere', async () => {
      repositories.buscarCodigoDoUsuario!.mockResolvedValue(
        codigoSalvoBase as any,
      );
      criptografiaBcrypt.verificarSenhasCombinam!.mockResolvedValue(true);

      await service.redefinirSenha(dadosRedefinicao);

      expect(criptografiaBcrypt.verificarSenhasCombinam).toHaveBeenCalledWith(
        '123456',
        codigoSalvoBase.codigoHash,
      );
      expect(repositories.redefinirSenhaEApagarCodigo).toHaveBeenCalledWith(
        usuarioBase.id,
        'hash-novo',
      );
    });

    it('conta a tentativa e recusa quando o código está errado', async () => {
      repositories.buscarCodigoDoUsuario!.mockResolvedValue(
        codigoSalvoBase as any,
      );
      criptografiaBcrypt.verificarSenhasCombinam!.mockResolvedValue(false);

      await expect(service.redefinirSenha(dadosRedefinicao)).rejects.toThrow(
        BadRequestException,
      );
      expect(repositories.registrarTentativaErrada).toHaveBeenCalledWith(
        usuarioBase.id,
      );
      expect(repositories.redefinirSenhaEApagarCodigo).not.toHaveBeenCalled();
    });

    it('recusa código expirado sem nem conferir o hash', async () => {
      repositories.buscarCodigoDoUsuario!.mockResolvedValue({
        ...codigoSalvoBase,
        expiraEm: new Date(Date.now() - 1000),
      } as any);

      await expect(service.redefinirSenha(dadosRedefinicao)).rejects.toThrow(
        BadRequestException,
      );
      expect(criptografiaBcrypt.verificarSenhasCombinam).not.toHaveBeenCalled();
    });

    it('recusa mesmo o código certo depois de 5 tentativas erradas', async () => {
      repositories.buscarCodigoDoUsuario!.mockResolvedValue({
        ...codigoSalvoBase,
        tentativas: 5,
      } as any);

      await expect(service.redefinirSenha(dadosRedefinicao)).rejects.toThrow(
        BadRequestException,
      );
      expect(criptografiaBcrypt.verificarSenhasCombinam).not.toHaveBeenCalled();
    });

    it('recusa quando o email não existe ou não há código pedido', async () => {
      repositories.buscarUsuarioPorEmail!.mockResolvedValue(null);
      await expect(service.redefinirSenha(dadosRedefinicao)).rejects.toThrow(
        BadRequestException,
      );

      repositories.buscarUsuarioPorEmail!.mockResolvedValue(usuarioBase as any);
      repositories.buscarCodigoDoUsuario!.mockResolvedValue(null);
      await expect(service.redefinirSenha(dadosRedefinicao)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
