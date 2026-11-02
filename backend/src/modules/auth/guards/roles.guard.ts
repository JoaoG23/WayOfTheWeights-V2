import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PerfilUsuario } from '../../../generated/prisma/enums';
import { PayloadJwt } from '../tipos/payload-jwt';
import { ehAdministrador } from '../regras/acesso-usuario';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<PerfilUsuario[]>(
      ROLES_KEY,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (!perfisPermitidos || perfisPermitidos.length === 0) {
      return true;
    }

    const usuarioAutenticado: PayloadJwt = contexto
      .switchToHttp()
      .getRequest().user;
    if (!usuarioAutenticado) {
      return false;
    }

    // Administrador pode fazer tudo, independente dos perfis da rota.
    if (ehAdministrador(usuarioAutenticado)) {
      return true;
    }

    return perfisPermitidos.includes(usuarioAutenticado.perfil);
  }
}
