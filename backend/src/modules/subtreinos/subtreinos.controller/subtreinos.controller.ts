import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { SubtreinosService } from '../subtreinos.service/subtreinos.service';
import { CriarSubtreinoDto } from '../subtreinos.dto/criar-subtreino.dto';
import { AtualizarSubtreinoDto } from '../subtreinos.dto/atualizar-subtreino.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Controller('treinos/:treinoId/subtreinos')
export class SubtreinosController {
  constructor(private readonly subtreinosService: SubtreinosService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Body() dadosSubtreino: CriarSubtreinoDto,
  ) {
    return this.subtreinosService.criar(
      usuarioAutenticado,
      treinoId,
      dadosSubtreino,
    );
  }

  @Get()
  async listarPorTreino(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
  ) {
    return this.subtreinosService.listarPorTreino(usuarioAutenticado, treinoId);
  }

  @Get(':id')
  async buscarPorId(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subtreinosService.buscarPorId(usuarioAutenticado, treinoId, id);
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosSubtreino: AtualizarSubtreinoDto,
  ) {
    return this.subtreinosService.atualizar(
      usuarioAutenticado,
      treinoId,
      id,
      dadosSubtreino,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.subtreinosService.remover(usuarioAutenticado, treinoId, id);
  }
}
