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

@Controller('treinos/:treinoId/exercicios/:exercicioId/series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Body() dadosSerie: CriarSerieDto,
  ) {
    return this.seriesService.criar(
      usuarioAutenticado,
      treinoId,
      exercicioId,
      dadosSerie,
    );
  }

  @Get()
  async listarPorExercicio(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
  ) {
    return this.seriesService.listarPorExercicio(
      usuarioAutenticado,
      treinoId,
      exercicioId,
    );
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosSerie: AtualizarSerieDto,
  ) {
    return this.seriesService.atualizar(
      usuarioAutenticado,
      treinoId,
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
    @Param('exercicioId', ParseIntPipe) exercicioId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.seriesService.remover(
      usuarioAutenticado,
      treinoId,
      exercicioId,
      id,
    );
  }
}
