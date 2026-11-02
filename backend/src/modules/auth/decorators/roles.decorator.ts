import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from '../../../generated/prisma/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...perfis: PerfilUsuario[]) =>
  SetMetadata(ROLES_KEY, perfis);
