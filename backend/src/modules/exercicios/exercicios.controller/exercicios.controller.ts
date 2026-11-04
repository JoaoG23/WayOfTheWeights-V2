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
import { ExerciciosService } from '../exercicios.service/exercicios.service';
import { CriarExercicioDto } from '../exercicios.dto/criar-exercicio.dto';
import { AtualizarExercicioDto } from '../exercicios.dto/atualizar-exercicio.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Controller('treinos/:treinoId/subtreinos/:subtreinoId/exercicios')
export class ExerciciosController {
  constructor(private readonly exerciciosService: ExerciciosService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Body() dadosExercicio: CriarExercicioDto,
  ) {
    return this.exerciciosService.criar(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      dadosExercicio,
    );
  }

  @Get()
  async listarPorSubtreino(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
  ) {
    return this.exerciciosService.listarPorSubtreino(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
    );
  }

  @Get(':id')
  async buscarPorId(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exerciciosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      id,
    );
  }

  @Get(':id/historico')
  async listarHistoricoCargas(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exerciciosService.listarHistoricoCargas(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      id,
    );
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosExercicio: AtualizarExercicioDto,
  ) {
    return this.exerciciosService.atualizar(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      id,
      dadosExercicio,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.exerciciosService.remover(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      id,
    );
  }
}
