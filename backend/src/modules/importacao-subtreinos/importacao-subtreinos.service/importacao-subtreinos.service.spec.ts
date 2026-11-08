import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { ImportacaoSubtreinosService } from './importacao-subtreinos.service';
import { ImportacaoSubtreinosRepositories } from '../importacao-subtreinos.repositories/importacao-subtreinos.repositories';
import { SubtreinoImportacaoDto } from '../importacao-subtreinos.dto/subtreino-importacao.dto';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { SubtreinosService } from '../../subtreinos/subtreinos.service/subtreinos.service';
import { GeminiService } from '../../../shared/gemini/gemini.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('ImportacaoSubtreinosService', () => {
  let service: ImportacaoSubtreinosService;
  let importacaoRepositories: jest.Mocked<Partial<ImportacaoSubtreinosRepositories>>;
  let treinosService: jest.Mocked<Partial<TreinosService>>;
  let subtreinosService: jest.Mocked<Partial<SubtreinosService>>;
  let geminiService: jest.Mocked<Partial<GeminiService>>;

  const usuarioAutenticado: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
  };
  const treinoId = 5;
  const imagemValida = {
    buffer: Buffer.from('imagem'),
    mimetype: 'image/jpeg',
  };
  const dadosImportacao: SubtreinoImportacaoDto = {
    titulo: 'Peito',
    exercicios: [
      { nome: 'Supino reto', cargaAtual: 40, repeticoesPorSerie: [12, 10] },
    ],
  };
  const subtreinoPersistido = {
    id: 7,
    treinoId,
    titulo: 'Peito',
    descricao: null,
    exercicios: [
      {
        id: 1,
        nome: 'Supino reto',
        carga: { valor: 40 },
        series: [{ repeticoes: 12 }, { repeticoes: 10 }],
      },
    ],
  };

  beforeEach(async () => {
    importacaoRepositories = {
      buscarDoTreino: jest.fn().mockResolvedValue(null),
      criarComExercicios: jest.fn().mockResolvedValue(subtreinoPersistido),
      atualizarComExercicios: jest.fn().mockResolvedValue(subtreinoPersistido),
    };
    treinosService = {
      buscarPorId: jest.fn().mockResolvedValue({ id: treinoId, usuarioId: 1 }),
    };
    subtreinosService = {
      validarLimiteDeSubtreinos: jest.fn().mockResolvedValue(undefined),
    };
    geminiService = { extrairJsonDeImagens: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportacaoSubtreinosService,
        {
          provide: ImportacaoSubtreinosRepositories,
          useValue: importacaoRepositories,
        },
        { provide: TreinosService, useValue: treinosService },
        { provide: SubtreinosService, useValue: subtreinosService },
        { provide: GeminiService, useValue: geminiService },
      ],
    }).compile();

    service = module.get(ImportacaoSubtreinosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('lerImagens', () => {
    it('rejeita quando nenhuma imagem é enviada', async () => {
      await expect(
        service.lerImagens(usuarioAutenticado, treinoId, []),
      ).rejects.toThrow(BadRequestException);
      expect(geminiService.extrairJsonDeImagens).not.toHaveBeenCalled();
    });

    it('rejeita formato de arquivo que não é imagem aceita', async () => {
      await expect(
        service.lerImagens(usuarioAutenticado, treinoId, [
          { buffer: Buffer.from('x'), mimetype: 'application/pdf' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('normaliza o JSON do Gemini (textos aparados e números inteiros)', async () => {
      geminiService.extrairJsonDeImagens!.mockResolvedValue({
        titulo: '  Peito  ',
        descricao: '',
        exercicios: [
          { nome: ' Supino ', cargaAtual: 40.4, repeticoesPorSerie: [12.2, 10] },
          { nome: '   ', cargaAtual: 10, repeticoesPorSerie: [] },
        ],
      });

      const leitura = await service.lerImagens(usuarioAutenticado, treinoId, [
        imagemValida,
      ]);

      expect(leitura).toEqual({
        titulo: 'Peito',
        descricao: undefined,
        exercicios: [
          { nome: 'Supino', cargaAtual: 40, repeticoesPorSerie: [12, 10] },
        ],
      });
    });

    it('falha quando nenhum exercício é identificado', async () => {
      geminiService.extrairJsonDeImagens!.mockResolvedValue({
        titulo: 'Peito',
        exercicios: [],
      });

      await expect(
        service.lerImagens(usuarioAutenticado, treinoId, [imagemValida]),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('importar', () => {
    it('cria o subtreino quando o id não existe no treino', async () => {
      const resposta = await service.importar(
        usuarioAutenticado,
        treinoId,
        999,
        dadosImportacao,
      );

      expect(subtreinosService.validarLimiteDeSubtreinos).toHaveBeenCalledWith(
        treinoId,
      );
      expect(importacaoRepositories.criarComExercicios).toHaveBeenCalledWith(
        treinoId,
        dadosImportacao,
      );
      expect(importacaoRepositories.atualizarComExercicios).not.toHaveBeenCalled();
      expect(resposta).toEqual({
        criado: true,
        id: 7,
        treinoId,
        titulo: 'Peito',
        descricao: null,
        exercicios: [
          {
            id: 1,
            nome: 'Supino reto',
            cargaAtual: 40,
            repeticoesPorSerie: [12, 10],
          },
        ],
      });
    });

    it('não cria quando o limite de subtreinos foi atingido', async () => {
      subtreinosService.validarLimiteDeSubtreinos!.mockRejectedValue(
        new ConflictException('limite'),
      );

      await expect(
        service.importar(usuarioAutenticado, treinoId, 999, dadosImportacao),
      ).rejects.toThrow(ConflictException);
      expect(importacaoRepositories.criarComExercicios).not.toHaveBeenCalled();
    });

    it('atualiza o subtreino quando o id existe no treino, sem checar o limite', async () => {
      importacaoRepositories.buscarDoTreino!.mockResolvedValue(
        subtreinoPersistido as any,
      );

      const resposta = await service.importar(
        usuarioAutenticado,
        treinoId,
        7,
        dadosImportacao,
      );

      expect(
        subtreinosService.validarLimiteDeSubtreinos,
      ).not.toHaveBeenCalled();
      expect(importacaoRepositories.atualizarComExercicios).toHaveBeenCalledWith(
        subtreinoPersistido,
        dadosImportacao,
      );
      expect(importacaoRepositories.criarComExercicios).not.toHaveBeenCalled();
      expect(resposta.criado).toBe(false);
    });

    it('rejeita exercícios com o mesmo nome no JSON', async () => {
      await expect(
        service.importar(usuarioAutenticado, treinoId, 7, {
          titulo: 'Peito',
          exercicios: [
            { nome: 'Supino', cargaAtual: 40 },
            { nome: ' supino ', cargaAtual: 50 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(importacaoRepositories.buscarDoTreino).not.toHaveBeenCalled();
    });

    it('valida o acesso ao treino antes de qualquer gravação', async () => {
      treinosService.buscarPorId!.mockRejectedValue(new Error('sem acesso'));

      await expect(
        service.importar(usuarioAutenticado, treinoId, 7, dadosImportacao),
      ).rejects.toThrow('sem acesso');
      expect(importacaoRepositories.buscarDoTreino).not.toHaveBeenCalled();
    });
  });
});
