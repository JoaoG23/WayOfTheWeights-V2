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

@Controller('treinos/:treinoId/exercicios')
export class ExerciciosController {
  constructor(private readonly exerciciosService: ExerciciosService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Body() dadosExercicio: CriarExercicioDto,
  ) {
    return this.exerciciosService.criar(
      usuarioAutenticado,
      treinoId,
      dadosExercicio,
    );
  }

  @Get()
  async listarPorTreino(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
  ) {
    return this.exerciciosService.listarPorTreino(usuarioAutenticado, treinoId);
  }

  @Get(':id')
  async buscarPorId(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exerciciosService.buscarPorId(usuarioAutenticado, treinoId, id);
  }

  @Get(':id/historico')
  async listarHistoricoCargas(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.exerciciosService.listarHistoricoCargas(
      usuarioAutenticado,
      treinoId,
      id,
    );
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosExercicio: AtualizarExercicioDto,
  ) {
    return this.exerciciosService.atualizar(
      usuarioAutenticado,
      treinoId,
      id,
      dadosExercicio,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.exerciciosService.remover(usuarioAutenticado, treinoId, id);
  }
}
