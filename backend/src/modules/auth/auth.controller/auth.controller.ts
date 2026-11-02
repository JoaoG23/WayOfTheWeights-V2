import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth.service/auth.service';
import { LoginDto } from '../auth.dto/login.dto';
import { Public } from '../decorators/public.decorator';
import {
  cookieConfig,
  NOME_COOKIE_TOKEN,
} from '../../../security/cookies.config';
import { TEMPO_EXPIRACAO_TOKEN_SEGUNDOS } from '../constantes/expiracao-token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // O token vai só no cookie httpOnly (não no corpo): o browser passa a
  // enviá-lo sozinho em toda requisição da sessão e nenhum JS consegue lê-lo.
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dadosLogin: LoginDto,
    @Res({ passthrough: true }) resposta: Response,
  ) {
    const { accessToken, usuario } = await this.authService.login(dadosLogin);

    resposta.cookie(NOME_COOKIE_TOKEN, accessToken, {
      ...cookieConfig,
      maxAge: TEMPO_EXPIRACAO_TOKEN_SEGUNDOS * 1000,
    });

    return usuario;
  }

  // Público para permitir sair mesmo com a sessão já expirada.
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Res({ passthrough: true }) resposta: Response) {
    resposta.clearCookie(NOME_COOKIE_TOKEN, cookieConfig);
  }
}
