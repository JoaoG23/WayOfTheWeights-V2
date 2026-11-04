import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UsuariosService } from '../usuarios.service/usuarios.service';
import { CriarContaDto } from '../usuarios.dto/criar-conta.dto';
import { AtualizarContaDto } from '../usuarios.dto/atualizar-conta.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

// Autocadastro (público: cria a conta no plano BASICO com quem se cadastrou
// como administrador proprietário), consulta e atualização dos dados do
// próprio usuário. O plano da conta fica em /conta/plano (ContasController) e
// a recuperação de senha em /auth/recuperar-senha (RecuperacaoSenhaController).
@Controller('conta')
export class ContaController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
  async criar(@Body() dadosConta: CriarContaDto) {
    return this.usuariosService.criarConta(dadosConta);
  }

  @Get()
  async buscar(@UsuarioAutenticado() usuarioAutenticado: PayloadJwt) {
    return this.usuariosService.buscarPorId(
      usuarioAutenticado.contaId,
      usuarioAutenticado.sub,
    );
  }

  @Put()
  async atualizar(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Body() dadosConta: AtualizarContaDto,
  ) {
    return this.usuariosService.atualizar(
      usuarioAutenticado.contaId,
      usuarioAutenticado.sub,
      dadosConta,
    );
  }
}
