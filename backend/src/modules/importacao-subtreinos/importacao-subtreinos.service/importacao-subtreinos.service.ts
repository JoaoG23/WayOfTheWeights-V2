import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ImportacaoSubtreinosRepositories,
  normalizarNome,
} from '../importacao-subtreinos.repositories/importacao-subtreinos.repositories';
import {
  ExercicioImportacaoDto,
  SubtreinoImportacaoDto,
} from '../importacao-subtreinos.dto/subtreino-importacao.dto';
import { ImportacaoSubtreinoRespostaDto } from '../importacao-subtreinos.dto/importacao-subtreino-resposta.dto';
import {
  ESQUEMA_RESPOSTA_OCR,
  INSTRUCAO_LEITURA_SUBTREINO,
} from './esquema-resposta-ocr';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { SubtreinosService } from '../../subtreinos/subtreinos.service/subtreinos.service';
import { GeminiService } from '../../../shared/gemini/gemini.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import {
  MAXIMO_IMAGENS_POR_LEITURA,
  TIPOS_IMAGEM_ACEITOS,
} from '../../../shared/constantes/limites-importacao';

// Formato mínimo do arquivo enviado (multer em memória).
export type ArquivoImagem = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
};

type SubtreinoImportado = Awaited<
  ReturnType<ImportacaoSubtreinosRepositories['criarComExercicios']>
>;

@Injectable()
export class ImportacaoSubtreinosService {
  constructor(
    private readonly importacaoRepositories: ImportacaoSubtreinosRepositories,
    private readonly treinosService: TreinosService,
    private readonly subtreinosService: SubtreinosService,
    private readonly geminiService: GeminiService,
  ) {}

  // Lê as imagens e devolve o JSON padronizado, SEM gravar nada: o cliente
  // confere/corrige o resultado e depois envia para a importação.
  async lerImagens(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    imagens: ArquivoImagem[] = [],
  ): Promise<SubtreinoImportacaoDto> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    this.validarImagens(imagens);

    const leituraBruta = await this.geminiService.extrairJsonDeImagens(
      imagens.map((imagem) => ({
        buffer: imagem.buffer,
        tipoMime: imagem.mimetype,
      })),
      INSTRUCAO_LEITURA_SUBTREINO,
      ESQUEMA_RESPOSTA_OCR,
    );
    return this.normalizarLeitura(leituraBruta);
  }

  // Upsert por id dentro do treino: se o subtreino existe, atualiza; senão,
  // cria um novo (o id é gerado pelo banco e devolvido na resposta).
  async importar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
    dadosSubtreino: SubtreinoImportacaoDto,
  ): Promise<ImportacaoSubtreinoRespostaDto> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    this.validarNomesUnicos(dadosSubtreino.exercicios);

    const subtreinoExistente = await this.importacaoRepositories.buscarDoTreino(
      id,
      treinoId,
    );
    if (!subtreinoExistente) {
      await this.subtreinosService.validarLimiteDeSubtreinos(treinoId);
      const subtreinoCriado =
        await this.importacaoRepositories.criarComExercicios(
          treinoId,
          dadosSubtreino,
        );
      return this.paraResposta(subtreinoCriado, true);
    }

    const subtreinoAtualizado =
      await this.importacaoRepositories.atualizarComExercicios(
        subtreinoExistente,
        dadosSubtreino,
      );
    return this.paraResposta(subtreinoAtualizado, false);
  }

  private validarImagens(imagens: ArquivoImagem[]) {
    if (imagens.length === 0) {
      throw new BadRequestException('Envie ao menos uma imagem em "imagens"');
    }
    if (imagens.length > MAXIMO_IMAGENS_POR_LEITURA) {
      throw new BadRequestException(
        `Envie no máximo ${MAXIMO_IMAGENS_POR_LEITURA} imagens por vez`,
      );
    }
    const formatoInvalido = imagens.find(
      (imagem) => !TIPOS_IMAGEM_ACEITOS.includes(imagem.mimetype),
    );
    if (formatoInvalido) {
      throw new BadRequestException(
        `Formato de imagem não aceito. Use: ${TIPOS_IMAGEM_ACEITOS.join(', ')}`,
      );
    }
  }

  // Dois exercícios com o mesmo nome no JSON tornariam o "update por nome"
  // ambíguo.
  private validarNomesUnicos(exercicios: ExercicioImportacaoDto[]) {
    const nomes = new Set<string>();
    for (const exercicio of exercicios) {
      const nomeNormalizado = normalizarNome(exercicio.nome);
      if (nomes.has(nomeNormalizado)) {
        throw new BadRequestException(
          `Exercício repetido na importação: "${exercicio.nome}"`,
        );
      }
      nomes.add(nomeNormalizado);
    }
  }

  // O Gemini segue o esquema, mas o resultado ainda é um rascunho: aqui só se
  // garante o formato (textos aparados, números inteiros). Os limites de
  // negócio (carga 1–1500 etc.) são validados na importação.
  private normalizarLeitura(leituraBruta: unknown): SubtreinoImportacaoDto {
    const leitura = leituraBruta as Partial<SubtreinoImportacaoDto> | null;
    const exercicios = leitura?.exercicios ?? [];

    const exerciciosLidos = exercicios
      .filter((exercicio) => exercicio?.nome?.trim())
      .map((exercicio) => ({
        nome: exercicio.nome.trim().slice(0, 70),
        cargaAtual: Math.round(Number(exercicio.cargaAtual)),
        repeticoesPorSerie: (exercicio.repeticoesPorSerie ?? []).map(
          (repeticoes) => Math.round(Number(repeticoes)),
        ),
      }));

    if (exerciciosLidos.length === 0) {
      throw new UnprocessableEntityException(
        'Nenhum exercício foi identificado nas imagens.',
      );
    }

    return {
      titulo: (leitura?.titulo ?? '').trim().slice(0, 70),
      descricao: leitura?.descricao?.trim() || undefined,
      exercicios: exerciciosLidos,
    };
  }

  private paraResposta(
    subtreino: SubtreinoImportado,
    criado: boolean,
  ): ImportacaoSubtreinoRespostaDto {
    return {
      criado,
      id: subtreino.id,
      treinoId: subtreino.treinoId,
      titulo: subtreino.titulo,
      descricao: subtreino.descricao,
      exercicios: subtreino.exercicios.map((exercicio) => ({
        id: exercicio.id,
        nome: exercicio.nome,
        cargaAtual: exercicio.carga.valor,
        repeticoesPorSerie: exercicio.series.map((serie) => serie.repeticoes),
      })),
    };
  }
}
