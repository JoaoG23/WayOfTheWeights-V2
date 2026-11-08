import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GenerateContentParameters, GoogleGenAI, Schema } from '@google/genai';

export type ImagemParaLeitura = {
  buffer: Buffer;
  tipoMime: string;
};

const MODELO_PADRAO = 'gemini-3.8-flash';
// Modelo de contingência quando o principal segue indisponível.
const MODELO_CONTINGENCIA_PADRAO = 'gemini-2.5-flash';
// Erros temporários do Gemini: sobrecarga (503), limite (429) e falhas de servidor.
const STATUS_TEMPORARIOS = [429, 500, 502, 503, 504];
const TENTATIVAS_POR_MODELO = 3;
const ESPERA_INICIAL_MS = 1000;

const esperar = (milissegundos: number) =>
  new Promise((resolve) => setTimeout(resolve, milissegundos));

const ehErroTemporario = (erro: unknown) =>
  STATUS_TEMPORARIOS.includes((erro as { status?: number })?.status ?? 0);

// Credenciais vêm do .env (GEMINI_API_KEY e, opcionalmente, GEMINI_MODEL). O
// cliente é criado na primeira utilização, para o app subir mesmo sem a chave
// configurada (ex.: testes).
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private cliente?: GoogleGenAI;

  // Envia as imagens e a instrução ao Gemini e devolve o JSON da resposta, já
  // convertido, seguindo o esquema informado.
  async extrairJsonDeImagens(
    imagens: ImagemParaLeitura[],
    instrucao: string,
    esquemaResposta: Record<string, unknown>,
  ): Promise<unknown> {
    const cliente = this.obterCliente();
    const contents = [
      {
        role: 'user',
        parts: [
          ...imagens.map((imagem) => ({
            inlineData: {
              mimeType: imagem.tipoMime,
              data: imagem.buffer.toString('base64'),
            },
          })),
          { text: instrucao },
        ],
      },
    ];

    let textoResposta: string | undefined;
    try {
      textoResposta = await this.gerarComRetentativas(
        cliente,
        contents,
        esquemaResposta,
      );
    } catch (erro) {
      this.logger.error('Falha ao consultar o Gemini', erro as Error);
      throw new BadGatewayException(
        'O serviço de leitura de imagens está sobrecarregado. Tente novamente em instantes.',
      );
    }

    try {
      return JSON.parse(textoResposta ?? '');
    } catch {
      throw new UnprocessableEntityException(
        'A leitura das imagens não retornou um resultado válido.',
      );
    }
  }

  // Tenta o modelo principal com espera crescente (1s, 2s...) e, se a
  // sobrecarga persistir, o modelo de contingência. Só erros temporários são
  // repetidos; os demais (chave inválida, requisição inválida) falham logo.
  private async gerarComRetentativas(
    cliente: GoogleGenAI,
    contents: GenerateContentParameters['contents'],
    esquemaResposta: Record<string, unknown>,
  ): Promise<string | undefined> {
    const modelos = [
      process.env.GEMINI_MODEL ?? MODELO_PADRAO,
      process.env.GEMINI_MODEL_CONTINGENCIA ?? MODELO_CONTINGENCIA_PADRAO,
    ].filter((modelo, posicao, lista) => lista.indexOf(modelo) === posicao);

    let ultimoErro: unknown;
    for (const modelo of modelos) {
      for (let tentativa = 1; tentativa <= TENTATIVAS_POR_MODELO; tentativa++) {
        try {
          const resposta = await cliente.models.generateContent({
            model: modelo,
            contents,
            config: {
              responseMimeType: 'application/json',
              responseSchema: esquemaResposta as Schema,
              temperature: 0,
            },
          });
          return resposta.text;
        } catch (erro) {
          if (!ehErroTemporario(erro)) throw erro;
          ultimoErro = erro;
          this.logger.warn(`Gemini (${modelo}) indisponível, tentativa ${tentativa}/${TENTATIVAS_POR_MODELO}`);
          if (tentativa < TENTATIVAS_POR_MODELO) {
            // Jitter evita que várias requisições tentem de novo juntas.
            const espera = ESPERA_INICIAL_MS * 2 ** (tentativa - 1);
            await esperar(espera + Math.random() * 500);
          }
        }
      }
    }
    throw ultimoErro;
  }

  private obterCliente(): GoogleGenAI {
    if (!process.env.GEMINI_API_KEY) {
      throw new ServiceUnavailableException(
        'Leitura de imagens indisponível: GEMINI_API_KEY não configurada.',
      );
    }
    this.cliente ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return this.cliente;
  }
}
