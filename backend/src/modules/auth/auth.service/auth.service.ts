import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CriptografiaBcryptService } from '../../../shared/criptografia/criptografia-bcrypt.service';
import { AuthRepositories } from '../auth.repositories/auth.repositories';
import { LoginDto } from '../auth.dto/login.dto';
import { PayloadJwt } from '../tipos/payload-jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepositories: AuthRepositories,
    private readonly criptografiaBcrypt: CriptografiaBcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dadosLogin: LoginDto) {
    const usuario = await this.authRepositories.buscarUsuarioPorEmail(
      dadosLogin.email,
    );
    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaCorreta = await this.criptografiaBcrypt.verificarSenhasCombinam(
      dadosLogin.senha,
      usuario.senhaHash,
    );
    if (!senhaCorreta) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const payload: PayloadJwt = {
      sub: usuario.id,
      contaId: usuario.contaId,
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        contaId: usuario.contaId,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
