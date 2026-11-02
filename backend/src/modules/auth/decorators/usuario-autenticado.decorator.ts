import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadJwt } from '../tipos/payload-jwt';

export const UsuarioAutenticado = createParamDecorator(
  (_dado: unknown, contexto: ExecutionContext): PayloadJwt => {
    const request = contexto.switchToHttp().getRequest();
    return request.user;
  },
);
