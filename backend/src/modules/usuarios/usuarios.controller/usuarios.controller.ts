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
import { UsuariosService } from '../usuarios.service/usuarios.service';
import { CriarUsuarioDto } from '../usuarios.dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../usuarios.dto/atualizar-usuario.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

// Gerenciamento dos usuários da conta é função do administrador. Cada
// usuário gerencia os próprios dados via /conta.
@Roles(PerfilUsuario.ADMINISTRADOR)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async criar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Body() dadosUsuario: CriarUsuarioDto,
  ) {
    return this.usuariosService.criar(usuarioAutenticado.contaId, dadosUsuario);
  }

  @Get()
  async listarTodos(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Query('numeroPagina') numeroPagina = 1,
    @Query('quantidadeItens') quantidadeItens = 10,
  ) {
    return this.usuariosService.listarTodos(
      usuarioAutenticado.contaId,
      Number(numeroPagina),
      Number(quantidadeItens),
    );
  }

  @Get(':id')
  async buscarPorId(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usuariosService.buscarPorId(usuarioAutenticado.contaId, id);
  }

  @Put(':id')
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
    @Body() dadosUsuario: AtualizarUsuarioDto,
  ) {
    return this.usuariosService.atualizar(
      usuarioAutenticado.contaId,
      id,
      dadosUsuario,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.usuariosService.remover(usuarioAutenticado.contaId, id);
  }
}
