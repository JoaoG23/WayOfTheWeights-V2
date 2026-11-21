import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FotosUsuarioRepositories } from '../fotos-usuario.repositories/fotos-usuario.repositories';
import { FotoUsuarioRespostaDto } from '../fotos-usuario.dto/foto-usuario-resposta.dto';
import { ArmazenamentoArquivosService } from '../../../shared/armazenamento/armazenamento-arquivos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { TIPOS_FOTO_ACEITOS } from '../../../shared/constantes/limites-foto';

const SUBPASTA_FOTOS = 'fotos';

const EXTENSAO_POR_TIPO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const TIPO_POR_EXTENSAO: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Formato mínimo do arquivo enviado (multer em memória).
export type ArquivoFoto = {
  buffer: Buffer;
  mimetype: string;
};

// Assinaturas (primeiros bytes) dos formatos aceitos: o tipo informado pelo
// cliente não basta para confiar no conteúdo.
const confereAssinatura = (buffer: Buffer, tipoMime: string): boolean => {
  if (tipoMime === 'image/jpeg') {
    return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  }
  if (tipoMime === 'image/png') {
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (tipoMime === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
};

@Injectable()
export class FotosUsuarioService {
  private readonly logger = new Logger(FotosUsuarioService.name);

  constructor(
    private readonly fotosUsuarioRepositories: FotosUsuarioRepositories,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  // Caminho e tipo do arquivo da foto, para o controller devolver a imagem.
  async obterArquivo(usuarioAutenticado: PayloadJwt) {
    const nomeArquivo = await this.fotosUsuarioRepositories.buscarNomeArquivo(
      usuarioAutenticado.sub,
    );
    const arquivoExiste =
      nomeArquivo !== null &&
      (await this.armazenamentoArquivos.existe(SUBPASTA_FOTOS, nomeArquivo));
    if (!nomeArquivo || !arquivoExiste) {
      throw new NotFoundException('Você ainda não tem foto de perfil');
    }

    const extensao = nomeArquivo.split('.').pop() ?? '';
    return {
      caminho: this.armazenamentoArquivos.caminho(SUBPASTA_FOTOS, nomeArquivo),
      tipoMime: TIPO_POR_EXTENSAO[extensao] ?? 'application/octet-stream',
    };
  }

  // Cada envio gera um arquivo novo (nome único) e só então apaga o anterior,
  // para nunca ficar sem foto se algo falhar no meio.
  async salvar(
    usuarioAutenticado: PayloadJwt,
    arquivo?: ArquivoFoto,
  ): Promise<FotoUsuarioRespostaDto> {
    this.validarArquivo(arquivo);

    const usuarioId = usuarioAutenticado.sub;
    const nomeArquivo = `${usuarioId}-${randomUUID()}.${EXTENSAO_POR_TIPO[arquivo.mimetype]}`;
    const nomeAnterior =
      await this.fotosUsuarioRepositories.buscarNomeArquivo(usuarioId);

    await this.armazenamentoArquivos.salvar(
      SUBPASTA_FOTOS,
      nomeArquivo,
      arquivo.buffer,
    );
    await this.fotosUsuarioRepositories.atualizarNomeArquivo(
      usuarioId,
      nomeArquivo,
    );
    if (nomeAnterior) await this.removerArquivoSemFalhar(nomeAnterior);

    return { fotoVersao: nomeArquivo };
  }

  async remover(usuarioAutenticado: PayloadJwt): Promise<void> {
    const usuarioId = usuarioAutenticado.sub;
    const nomeArquivo =
      await this.fotosUsuarioRepositories.buscarNomeArquivo(usuarioId);
    if (!nomeArquivo) return;

    await this.fotosUsuarioRepositories.atualizarNomeArquivo(usuarioId, null);
    await this.removerArquivoSemFalhar(nomeArquivo);
  }

  // Arquivo órfão no disco não deve derrubar a operação: só registra.
  private async removerArquivoSemFalhar(nomeArquivo: string) {
    try {
      await this.armazenamentoArquivos.remover(SUBPASTA_FOTOS, nomeArquivo);
    } catch (erro) {
      this.logger.warn(
        `Não foi possível apagar o arquivo antigo ${nomeArquivo}`,
        erro as Error,
      );
    }
  }

  private validarArquivo(
    arquivo?: ArquivoFoto,
  ): asserts arquivo is ArquivoFoto {
    if (!arquivo) {
      throw new BadRequestException('Envie a imagem no campo "foto"');
    }
    if (!TIPOS_FOTO_ACEITOS.includes(arquivo.mimetype)) {
      throw new BadRequestException(
        `Formato não aceito. Use: ${TIPOS_FOTO_ACEITOS.join(', ')}`,
      );
    }
    if (!confereAssinatura(arquivo.buffer, arquivo.mimetype)) {
      throw new BadRequestException('O arquivo não é uma imagem válida');
    }
  }
}
