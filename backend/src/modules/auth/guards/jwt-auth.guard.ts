import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { NOME_COOKIE_TOKEN } from '../../../security/cookies.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = contexto.switchToHttp().getRequest();
    const token = this.extrairToken(request);
    if (!token) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    return true;
  }

  // Cookie httpOnly é o meio principal (browser envia sozinho em toda
  // requisição da sessão). O header Bearer fica como alternativa para
  // clientes sem cookie, como um app mobile nativo.
  private extrairToken(request: Request): string | undefined {
    const tokenDoCookie = request.cookies?.[NOME_COOKIE_TOKEN];
    if (tokenDoCookie) {
      return tokenDoCookie;
    }

    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
