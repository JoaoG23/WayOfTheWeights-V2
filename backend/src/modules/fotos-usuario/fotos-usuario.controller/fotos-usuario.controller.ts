import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Put,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import {
  ArquivoFoto,
  FotosUsuarioService,
} from '../fotos-usuario.service/fotos-usuario.service';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { TAMANHO_MAXIMO_FOTO_BYTES } from '../../../shared/constantes/limites-foto';

// Foto de perfil do próprio usuário logado.
@Controller('conta/foto')
export class FotosUsuarioController {
  constructor(private readonly fotosUsuarioService: FotosUsuarioService) {}

  // Devolve a própria imagem. O nome do arquivo (fotoVersao, em GET /conta) vai
  // na URL como ?v=, então o cache pode ser longo: foto nova, URL nova.
  @Get()
  @Header('Cache-Control', 'private, max-age=31536000, immutable')
  async buscar(@UsuarioAutenticado() usuarioAutenticado: PayloadJwt) {
    const { caminho, tipoMime } =
      await this.fotosUsuarioService.obterArquivo(usuarioAutenticado);
    return new StreamableFile(createReadStream(caminho), { type: tipoMime });
  }

  // multipart/form-data, campo "foto" (jpeg, png ou webp, até 2 MB).
  @Put()
  @UseInterceptors(
    FileInterceptor('foto', {
      limits: { fileSize: TAMANHO_MAXIMO_FOTO_BYTES },
    }),
  )
  async salvar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @UploadedFile() arquivo: ArquivoFoto,
  ) {
    return this.fotosUsuarioService.salvar(usuarioAutenticado, arquivo);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(@UsuarioAutenticado() usuarioAutenticado: PayloadJwt) {
    await this.fotosUsuarioService.remover(usuarioAutenticado);
  }
}
