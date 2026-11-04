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
import { SeriesService } from '../series.service/series.service';
import { CriarSerieDto } from '../series.dto/criar-serie.dto';
import { AtualizarSerieDto } from '../series.dto/atualizar-serie.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Controller('treinos/:treinoId/subtreinos/:subtreinoId/exercicios/:exercicioId/series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Body() dadosSerie: CriarSerieDto,
  ) {
    return this.seriesService.criar(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
      dadosSerie,
    );
  }

  @Get()
  async listarPorExercicio(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
  ) {
    return this.seriesService.listarPorExercicio(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
    );
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosSerie: AtualizarSerieDto,
  ) {
    return this.seriesService.atualizar(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
      id,
      dadosSerie,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.seriesService.remover(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
      id,
    );
  }
}
