import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CriptografiaBcryptService } from '../../../shared/criptografia/criptografia-bcrypt.service';
import { UsuariosRepositories } from '../usuarios.repositories/usuarios.repositories';
import { CriarUsuarioDto } from '../usuarios.dto/criar-usuario.dto';
import { CriarContaDto } from '../usuarios.dto/criar-conta.dto';
import { AtualizarUsuarioDto } from '../usuarios.dto/atualizar-usuario.dto';
import { UsuarioRespostaDto } from '../usuarios.dto/usuario-resposta.dto';
import { ContasService } from '../../contas/contas.service/contas.service';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuariosRepositories: UsuariosRepositories,
    private readonly criptografiaBcrypt: CriptografiaBcryptService,
    private readonly contasService: ContasService,
  ) {}

  // Criação feita pelo administrador dentro da própria conta, respeitando o
  // limite de usuários por perfil do plano.
  async criar(
    contaId: number,
    dadosUsuario: CriarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    await this.validarEmailDisponivel(dadosUsuario.email);
    await this.contasService.validarVagaDisponivel(
      contaId,
      dadosUsuario.perfil,
    );

    const senhaHash = await this.criptografiaBcrypt.criptografarSenha(
      dadosUsuario.senha,
    );
    const usuarioCriado = await this.usuariosRepositories.criar({
      contaId,
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      senhaHash,
      perfil: dadosUsuario.perfil,
      proprietario: false,
    });

    return this.paraResposta(usuarioCriado);
  }

  // Autocadastro público: cria uma nova conta no plano BASICO, tendo quem se
  // cadastrou como administrador proprietário.
  async criarConta(dadosConta: CriarContaDto): Promise<UsuarioRespostaDto> {
    await this.validarEmailDisponivel(dadosConta.email);

    const senhaHash = await this.criptografiaBcrypt.criptografarSenha(
      dadosConta.senha,
    );
    const usuarioCriado = await this.usuariosRepositories.criarComNovaConta(
      {
        nome: dadosConta.nome,
        email: dadosConta.email,
        senhaHash,
        perfil: PerfilUsuario.ADMINISTRADOR,
        proprietario: true,
      },
      PlanoConta.BASICO,
    );

    return this.paraResposta(usuarioCriado);
  }

  async listarTodos(
    contaId: number,
    numeroPagina: number,
    quantidadeItens: number,
  ) {
    const pular = (numeroPagina - 1) * quantidadeItens;
    const { total, usuarios } =
      await this.usuariosRepositories.listarTodosDaConta(
        contaId,
        pular,
        quantidadeItens,
      );

    return {
      totalItens: total,
      usuarios: usuarios.map((usuario) => this.paraResposta(usuario)),
    };
  }

  async buscarPorId(contaId: number, id: number): Promise<UsuarioRespostaDto> {
    const usuario = await this.validarUsuarioExiste(contaId, id);
    return this.paraResposta(usuario);
  }

  async atualizar(
    contaId: number,
    id: number,
    dadosUsuario: AtualizarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    const usuario = await this.validarUsuarioExiste(contaId, id);

    const perfilAlterado =
      dadosUsuario.perfil !== undefined &&
      dadosUsuario.perfil !== usuario.perfil;
    this.validarAlteracaoDoProprietario(
      usuario,
      perfilAlterado,
      dadosUsuario.ativo,
    );
    if (perfilAlterado) {
      await this.contasService.validarVagaDisponivel(
        contaId,
        dadosUsuario.perfil,
      );
    }

    if (dadosUsuario.email) {
      const usuarioComMesmoEmail =
        await this.usuariosRepositories.buscarPorEmail(dadosUsuario.email);
      if (usuarioComMesmoEmail && usuarioComMesmoEmail.id !== id) {
        throw new ConflictException('Esse email já está cadastrado');
      }
    }

    const senhaHash = dadosUsuario.senha
      ? await this.criptografiaBcrypt.criptografarSenha(dadosUsuario.senha)
      : undefined;

    const usuarioAtualizado = await this.usuariosRepositories.atualizar(id, {
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      senhaHash,
      perfil: dadosUsuario.perfil,
      ativo: dadosUsuario.ativo,
    });

    return this.paraResposta(usuarioAtualizado);
  }

  async remover(contaId: number, id: number): Promise<void> {
    const usuario = await this.validarUsuarioExiste(contaId, id);
    if (usuario.proprietario) {
      throw new ConflictException(
        'Não é possível remover o proprietário da conta',
      );
    }
    await this.usuariosRepositories.remover(id);
  }

  private async validarEmailDisponivel(email: string) {
    const usuarioExistente =
      await this.usuariosRepositories.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new ConflictException('Esse email já está cadastrado');
    }
  }

  // Usuário de outra conta responde 404, para não revelar que o id existe.
  private async validarUsuarioExiste(contaId: number, id: number) {
    const usuario = await this.usuariosRepositories.buscarPorIdNaConta(
      contaId,
      id,
    );
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  // A conta nunca pode ficar sem o administrador que a criou.
  private validarAlteracaoDoProprietario(
    usuario: { proprietario: boolean },
    perfilAlterado: boolean,
    ativo?: boolean,
  ) {
    if (usuario.proprietario && (perfilAlterado || ativo === false)) {
      throw new ConflictException(
        'Não é possível desativar nem alterar o perfil do proprietário da conta',
      );
    }
  }

  private paraResposta(usuario: {
    id: number;
    contaId: number;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    ativo: boolean;
    proprietario: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
  }): UsuarioRespostaDto {
    const {
      id,
      contaId,
      nome,
      email,
      perfil,
      ativo,
      proprietario,
      criadoEm,
      atualizadoEm,
    } = usuario;
    return {
      id,
      contaId,
      nome,
      email,
      perfil,
      ativo,
      proprietario,
      criadoEm,
      atualizadoEm,
    };
  }
}
