import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { FotosUsuarioService } from './fotos-usuario.service';
import { FotosUsuarioRepositories } from '../fotos-usuario.repositories/fotos-usuario.repositories';
import { ArmazenamentoArquivosService } from '../../../shared/armazenamento/armazenamento-arquivos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

// Arquivos simulados: só os primeiros bytes (assinatura) importam ao serviço.
const ASSINATURA_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const ASSINATURA_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

describe('FotosUsuarioService', () => {
  let service: FotosUsuarioService;
  let fotosRepositories: jest.Mocked<Partial<FotosUsuarioRepositories>>;
  let armazenamento: jest.Mocked<Partial<ArmazenamentoArquivosService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 4,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };

  beforeEach(async () => {
    fotosRepositories = {
      buscarNomeArquivo: jest.fn().mockResolvedValue(null),
      atualizarNomeArquivo: jest.fn().mockResolvedValue({ id: 4 }),
    };
    armazenamento = {
      salvar: jest.fn().mockResolvedValue(undefined),
      existe: jest.fn().mockResolvedValue(true),
      remover: jest.fn().mockResolvedValue(undefined),
      caminho: jest.fn().mockReturnValue('/uploads/fotos/4-abc.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FotosUsuarioService,
        { provide: FotosUsuarioRepositories, useValue: fotosRepositories },
        { provide: ArmazenamentoArquivosService, useValue: armazenamento },
      ],
    }).compile();

    service = module.get(FotosUsuarioService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('salvar', () => {
    it('grava o arquivo, guarda o nome no usuário e devolve a versão', async () => {
      const resposta = await service.salvar(usuarioAutenticado, {
        buffer: ASSINATURA_JPEG,
        mimetype: 'image/jpeg',
      });

      expect(resposta.fotoVersao).toMatch(/^4-[0-9a-f-]{36}\.jpg$/);
      expect(armazenamento.salvar).toHaveBeenCalledWith(
        'fotos',
        resposta.fotoVersao,
        ASSINATURA_JPEG,
      );
      expect(fotosRepositories.atualizarNomeArquivo).toHaveBeenCalledWith(
        4,
        resposta.fotoVersao,
      );
      expect(armazenamento.remover).not.toHaveBeenCalled();
    });

    it('apaga a foto anterior depois de salvar a nova', async () => {
      fotosRepositories.buscarNomeArquivo!.mockResolvedValue('4-antiga.png');

      await service.salvar(usuarioAutenticado, {
        buffer: ASSINATURA_PNG,
        mimetype: 'image/png',
      });

      expect(armazenamento.remover).toHaveBeenCalledWith(
        'fotos',
        '4-antiga.png',
      );
    });

    it('não falha se não conseguir apagar a foto anterior', async () => {
      fotosRepositories.buscarNomeArquivo!.mockResolvedValue('4-antiga.png');
      armazenamento.remover!.mockRejectedValue(new Error('disco'));

      await expect(
        service.salvar(usuarioAutenticado, {
          buffer: ASSINATURA_PNG,
          mimetype: 'image/png',
        }),
      ).resolves.toEqual({ fotoVersao: expect.any(String) });
    });

    it('rejeita quando nenhum arquivo é enviado', async () => {
      await expect(
        service.salvar(usuarioAutenticado, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita formato que não é imagem aceita', async () => {
      await expect(
        service.salvar(usuarioAutenticado, {
          buffer: ASSINATURA_JPEG,
          mimetype: 'application/pdf',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(armazenamento.salvar).not.toHaveBeenCalled();
    });

    it('rejeita arquivo cujo conteúdo não confere com o tipo informado', async () => {
      await expect(
        service.salvar(usuarioAutenticado, {
          buffer: Buffer.from('não sou uma imagem'),
          mimetype: 'image/jpeg',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(armazenamento.salvar).not.toHaveBeenCalled();
    });
  });

  describe('obterArquivo', () => {
    it('devolve o caminho e o tipo da foto', async () => {
      fotosRepositories.buscarNomeArquivo!.mockResolvedValue('4-abc.jpg');

      const arquivo = await service.obterArquivo(usuarioAutenticado);

      expect(arquivo).toEqual({
        caminho: '/uploads/fotos/4-abc.jpg',
        tipoMime: 'image/jpeg',
      });
    });

    it('responde 404 quando o usuário não tem foto', async () => {
      await expect(service.obterArquivo(usuarioAutenticado)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('responde 404 quando o arquivo sumiu do disco', async () => {
      fotosRepositories.buscarNomeArquivo!.mockResolvedValue('4-abc.jpg');
      armazenamento.existe!.mockResolvedValue(false);

      await expect(service.obterArquivo(usuarioAutenticado)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remover', () => {
    it('limpa o usuário e apaga o arquivo', async () => {
      fotosRepositories.buscarNomeArquivo!.mockResolvedValue('4-abc.jpg');

      await service.remover(usuarioAutenticado);

      expect(fotosRepositories.atualizarNomeArquivo).toHaveBeenCalledWith(
        4,
        null,
      );
      expect(armazenamento.remover).toHaveBeenCalledWith('fotos', '4-abc.jpg');
    });

    it('não faz nada quando o usuário não tem foto', async () => {
      await service.remover(usuarioAutenticado);

      expect(fotosRepositories.atualizarNomeArquivo).not.toHaveBeenCalled();
      expect(armazenamento.remover).not.toHaveBeenCalled();
    });
  });
});
