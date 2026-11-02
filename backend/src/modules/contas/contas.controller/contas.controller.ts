import { Body, Controller, Get, Put } from '@nestjs/common';
import { ContasService } from '../contas.service/contas.service';
import { AtualizarPlanoDto } from '../contas.dto/atualizar-plano.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

// Plano da conta do usuário autenticado. Os dados do próprio usuário ficam
// em /conta (ContaController, módulo usuarios).
@Controller('conta/plano')
export class ContasController {
  constructor(private readonly contasService: ContasService) {}

  @Get()
  async buscarPlano(@UsuarioAutenticado() usuarioAutenticado: PayloadJwt) {
    return this.contasService.buscarPlano(usuarioAutenticado.contaId);
  }

  @Roles(PerfilUsuario.ADMINISTRADOR)
  @Put()
  async atualizarPlano(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Body() dadosPlano: AtualizarPlanoDto,
  ) {
    return this.contasService.atualizarPlano(
      usuarioAutenticado.contaId,
      dadosPlano.plano,
    );
  }
}
