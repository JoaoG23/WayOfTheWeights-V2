import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { CriptografiaBcryptService } from '../../../shared/criptografia/criptografia-bcrypt.service';
import { EmailService } from '../../../shared/email/email.service';
import { RecuperacaoSenhaRepositories } from '../recuperacao-senha.repositories/recuperacao-senha.repositories';
import { SolicitarCodigoDto } from '../recuperacao-senha.dto/solicitar-codigo.dto';
import { RedefinirSenhaDto } from '../recuperacao-senha.dto/redefinir-senha.dto';

const VALIDADE_CODIGO_MINUTOS = 15;
const MAXIMO_TENTATIVAS_ERRADAS = 5;
// Evita usar o endpoint para disparar emails em sequência para um usuário.
const INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS = 60;

@Injectable()
export class RecuperacaoSenhaService {
  private readonly logger = new Logger(RecuperacaoSenhaService.name);

  constructor(
    private readonly recuperacaoSenhaRepositories: RecuperacaoSenhaRepositories,
    private readonly criptografiaBcrypt: CriptografiaBcryptService,
    private readonly emailService: EmailService,
  ) {}

  // Resposta sempre igual (sucesso silencioso), exista o email ou não, para
  // não revelar quais emails estão cadastrados. Falha de SMTP também não
  // vaza para o cliente, só vai para o log.
  async solicitarCodigo(dadosSolicitacao: SolicitarCodigoDto): Promise<void> {
    const usuario =
      await this.recuperacaoSenhaRepositories.buscarUsuarioPorEmail(
        dadosSolicitacao.email,
      );
    if (!usuario || !usuario.ativo) {
      return;
    }

    const codigoAnterior =
      await this.recuperacaoSenhaRepositories.buscarCodigoDoUsuario(usuario.id);
    if (codigoAnterior && this.enviadoRecentemente(codigoAnterior.criadoEm)) {
      return;
    }

    const codigo = this.gerarCodigo();
    const codigoHash = await this.criptografiaBcrypt.criptografarSenha(codigo);
    await this.recuperacaoSenhaRepositories.salvarCodigo(
      usuario.id,
      codigoHash,
      new Date(Date.now() + VALIDADE_CODIGO_MINUTOS * 60 * 1000),
    );

    try {
      await this.emailService.enviarCodigoRecuperacaoSenha(
        usuario.email,
        usuario.nome,
        codigo,
        VALIDADE_CODIGO_MINUTOS,
      );
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar o código de recuperação para o usuário ${usuario.id}`,
        erro instanceof Error ? erro.stack : String(erro),
      );
    }
  }

  async redefinirSenha(dadosRedefinicao: RedefinirSenhaDto): Promise<void> {
    const usuario =
      await this.recuperacaoSenhaRepositories.buscarUsuarioPorEmail(
        dadosRedefinicao.email,
      );
    const codigoSalvo = usuario
      ? await this.recuperacaoSenhaRepositories.buscarCodigoDoUsuario(
          usuario.id,
        )
      : null;

    if (
      !usuario ||
      !usuario.ativo ||
      !codigoSalvo ||
      codigoSalvo.expiraEm < new Date() ||
      codigoSalvo.tentativas >= MAXIMO_TENTATIVAS_ERRADAS
    ) {
      this.lancarCodigoInvalido();
    }

    const codigoCorreto = await this.criptografiaBcrypt.verificarSenhasCombinam(
      dadosRedefinicao.codigo,
      codigoSalvo.codigoHash,
    );
    if (!codigoCorreto) {
      await this.recuperacaoSenhaRepositories.registrarTentativaErrada(
        usuario.id,
      );
      this.lancarCodigoInvalido();
    }

    const senhaHash = await this.criptografiaBcrypt.criptografarSenha(
      dadosRedefinicao.novaSenha,
    );
    await this.recuperacaoSenhaRepositories.redefinirSenhaEApagarCodigo(
      usuario.id,
      senhaHash,
    );
  }

  // 6 dígitos com zeros à esquerda, de fonte criptograficamente segura.
  private gerarCodigo(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private enviadoRecentemente(criadoEm: Date): boolean {
    return (
      Date.now() - criadoEm.getTime() <
      INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS * 1000
    );
  }

  // Mesma mensagem para email inexistente, código errado, expirado ou
  // travado por tentativas.
  private lancarCodigoInvalido(): never {
    throw new BadRequestException('Código inválido ou expirado');
  }
}
