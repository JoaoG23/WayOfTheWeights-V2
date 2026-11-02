import {
  podeAcessarRecursoDoUsuario,
  resolverUsuarioIdAlvo,
} from './acesso-usuario';
import { PayloadJwt } from '../tipos/payload-jwt';
import { PerfilUsuario } from '../../../generated/prisma/enums';

describe('acesso-usuario', () => {
  const aluno: PayloadJwt = {
    sub: 1,
    contaId: 1,
    perfil: PerfilUsuario.ALUNO,
    nome: 'Aluno',
    email: 'aluno@teste.com',
  };
  const treinador: PayloadJwt = {
    sub: 2,
    contaId: 1,
    perfil: PerfilUsuario.TREINADOR,
    nome: 'Treinador',
    email: 'treinador@teste.com',
  };
  const administrador: PayloadJwt = {
    sub: 3,
    contaId: 1,
    perfil: PerfilUsuario.ADMINISTRADOR,
    nome: 'Admin',
    email: 'admin@teste.com',
  };

  describe('resolverUsuarioIdAlvo', () => {
    it('ignora o usuarioId informado pelo aluno', () => {
      expect(resolverUsuarioIdAlvo(aluno, 99)).toBe(aluno.sub);
    });

    it('usa o usuarioId informado pelo administrador e pelo treinador', () => {
      expect(resolverUsuarioIdAlvo(administrador, 99)).toBe(99);
      expect(resolverUsuarioIdAlvo(treinador, 99)).toBe(99);
    });

    it('usa o próprio id quando nada é informado', () => {
      expect(resolverUsuarioIdAlvo(administrador)).toBe(administrador.sub);
    });
  });

  describe('podeAcessarRecursoDoUsuario', () => {
    it('aluno acessa apenas os próprios recursos', () => {
      expect(podeAcessarRecursoDoUsuario(aluno, aluno.sub)).toBe(true);
      expect(podeAcessarRecursoDoUsuario(aluno, 99)).toBe(false);
    });

    it('administrador e treinador acessam recursos de outros usuários', () => {
      expect(podeAcessarRecursoDoUsuario(administrador, 99)).toBe(true);
      expect(podeAcessarRecursoDoUsuario(treinador, 99)).toBe(true);
    });
  });
});
