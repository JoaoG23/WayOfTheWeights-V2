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
  Query,
} from '@nestjs/common';
import { TreinosService } from '../treinos.service/treinos.service';
import { CriarTreinoDto } from '../treinos.dto/criar-treino.dto';
import { AtualizarTreinoDto } from '../treinos.dto/atualizar-treino.dto';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { FiltroUsuarioDto } from '../../../shared/dto/filtro-usuario.dto';

@Controller('treinos')
export class TreinosController {
  constructor(private readonly treinosService: TreinosService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Body() dadosTreino: CriarTreinoDto,
  ) {
    return this.treinosService.criar(usuarioAutenticado, dadosTreino);
  }

  @Get()
  async listar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Query() filtro: FiltroUsuarioDto,
  ) {
    return this.treinosService.listar(usuarioAutenticado, filtro.usuarioId);
  }

  @Get(':id')
  async buscarPorId(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.treinosService.buscarPorId(usuarioAutenticado, id);
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosTreino: AtualizarTreinoDto,
  ) {
    return this.treinosService.atualizar(usuarioAutenticado, id, dadosTreino);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.treinosService.remover(usuarioAutenticado, id);
  }
}
