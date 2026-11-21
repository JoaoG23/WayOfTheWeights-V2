import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ConclusoesService } from '../conclusoes.service/conclusoes.service';
import { CriarConclusaoDto } from '../conclusoes.dto/criar-conclusao.dto';
import { FiltroConclusoesDto } from '../conclusoes.dto/filtro-conclusoes.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Controller()
export class ConclusoesController {
  constructor(private readonly conclusoesService: ConclusoesService) {}

  // Finaliza o checklist: registra os exercícios marcados (todos ou só alguns).
  @Post('treinos/:treinoId/subtreinos/:subtreinoId/conclusoes')
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('treinoId', ParseIntPipe) treinoId: number,
    @Param('subtreinoId', ParseIntPipe) subtreinoId: number,
    @Body() dadosConclusao: CriarConclusaoDto,
  ) {
    return this.conclusoesService.criar(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      dadosConclusao,
    );
  }

  // Histórico de treinos realizados (base do calendário semanal do dashboard).
  @Get('conclusoes')
  async listar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Query() filtro: FiltroConclusoesDto,
  ) {
    return this.conclusoesService.listar(usuarioAutenticado, filtro);
  }
}
