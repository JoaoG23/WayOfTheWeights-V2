import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RecuperacaoSenhaService } from '../recuperacao-senha.service/recuperacao-senha.service';
import { SolicitarCodigoDto } from '../recuperacao-senha.dto/solicitar-codigo.dto';
import { RedefinirSenhaDto } from '../recuperacao-senha.dto/redefinir-senha.dto';
import { Public } from '../../auth/decorators/public.decorator';

// Fluxo "esqueci minha senha": o usuário não tem sessão, então as duas rotas
// são públicas. 1) pede o código por email; 2) informa o código e a nova senha.
@Public()
@Controller('auth')
export class RecuperacaoSenhaController {
  constructor(
    private readonly recuperacaoSenhaService: RecuperacaoSenhaService,
  ) {}

  @Post('recuperar-senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  async solicitarCodigo(@Body() dadosSolicitacao: SolicitarCodigoDto) {
    await this.recuperacaoSenhaService.solicitarCodigo(dadosSolicitacao);
  }

  @Post('redefinir-senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  async redefinirSenha(@Body() dadosRedefinicao: RedefinirSenhaDto) {
    await this.recuperacaoSenhaService.redefinirSenha(dadosRedefinicao);
  }
}
