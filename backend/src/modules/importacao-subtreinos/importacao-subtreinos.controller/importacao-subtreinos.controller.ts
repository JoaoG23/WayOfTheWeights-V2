import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ArquivoImagem,
  ImportacaoSubtreinosService,
} from '../importacao-subtreinos.service/importacao-subtreinos.service';
import { SubtreinoImportacaoDto } from '../importacao-subtreinos.dto/subtreino-importacao.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import {
  MAXIMO_IMAGENS_POR_LEITURA,
  TAMANHO_MAXIMO_IMAGEM_BYTES,
} from '../../../shared/constantes/limites-importacao';

@Controller('treinos/:treinoId/subtreinos')
export class ImportacaoSubtreinosController {
  constructor(
    private readonly importacaoSubtreinosService: ImportacaoSubtreinosService,
  ) {}

  // multipart/form-data, campo "imagens" (uma ou mais). Só lê: não grava.
  @Post('ocr')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('imagens', MAXIMO_IMAGENS_POR_LEITURA, {
      limits: { fileSize: TAMANHO_MAXIMO_IMAGEM_BYTES },
    }),
  )
  async lerImagens(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @UploadedFiles() imagens: ArquivoImagem[],
  ) {
    return this.importacaoSubtreinosService.lerImagens(
      usuarioAutenticado,
      treinoId,
      imagens,
    );
  }

  // Upsert por id: atualiza o subtreino se ele existir neste treino; senão
  // cria um novo.
  @Put(':id/importar')
  async importar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosSubtreino: SubtreinoImportacaoDto,
  ) {
    return this.importacaoSubtreinosService.importar(
      usuarioAutenticado,
      treinoId,
      id,
      dadosSubtreino,
    );
  }
}
