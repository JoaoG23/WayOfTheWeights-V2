import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContasRepositories } from '../contas.repositories/contas.repositories';
import { PlanoContaRespostaDto } from '../contas.dto/plano-conta-resposta.dto';
import {
  LIMITES_POR_PLANO,
  QuantidadePorPerfil,
} from '../regras/limites-plano';
import { PerfilUsuario, PlanoConta } from '../../../generated/prisma/enums';

@Injectable()
export class ContasService {
  constructor(private readonly contasRepositories: ContasRepositories) {}

  async buscarPlano(contaId: number): Promise<PlanoContaRespostaDto> {
    const conta = await this.validarContaExiste(contaId);
    const usuariosPorPerfil = await this.contarUsuariosPorPerfil(contaId);

    return {
      contaId: conta.id,
      plano: conta.plano,
      limites: LIMITES_POR_PLANO[conta.plano],
      usuariosPorPerfil,
    };
  }

  async atualizarPlano(
    contaId: number,
    novoPlano: PlanoConta,
  ): Promise<PlanoContaRespostaDto> {
    await this.validarContaExiste(contaId);
    await this.validarUsuariosCabemNoPlano(contaId, novoPlano);

    await this.contasRepositories.atualizarPlano(contaId, novoPlano);
    return this.buscarPlano(contaId);
  }

  // Chamado antes de a conta ganhar mais um usuário com esse perfil
  // (criação ou troca de perfil).
  async validarVagaDisponivel(contaId: number, perfil: PerfilUsuario) {
    const conta = await this.validarContaExiste(contaId);
    const limitePerfil = LIMITES_POR_PLANO[conta.plano][perfil];
    const quantidadeAtual =
      await this.contasRepositories.contarUsuariosDoPerfil(contaId, perfil);

    if (quantidadeAtual >= limitePerfil) {
      throw new ConflictException(
        `O plano ${conta.plano} permite no máximo ${limitePerfil} usuário(s) com perfil ${perfil}`,
      );
    }
  }

  // Impede downgrade quando a conta já tem mais usuários do que o novo plano
  // permite em algum perfil.
  private async validarUsuariosCabemNoPlano(
    contaId: number,
    novoPlano: PlanoConta,
  ) {
    const usuariosPorPerfil = await this.contarUsuariosPorPerfil(contaId);
    const limitesNovoPlano = LIMITES_POR_PLANO[novoPlano];

    const perfisExcedidos = Object.values(PerfilUsuario).filter(
      (perfil) => usuariosPorPerfil[perfil] > limitesNovoPlano[perfil],
    );
    if (perfisExcedidos.length > 0) {
      throw new ConflictException(
        `A conta excede os limites do plano ${novoPlano} nos perfis: ${perfisExcedidos.join(', ')}`,
      );
    }
  }

  private async contarUsuariosPorPerfil(
    contaId: number,
  ): Promise<QuantidadePorPerfil> {
    const contagens =
      await this.contasRepositories.contarUsuariosPorPerfil(contaId);

    const usuariosPorPerfil = {
      [PerfilUsuario.ADMINISTRADOR]: 0,
      [PerfilUsuario.TREINADOR]: 0,
      [PerfilUsuario.ALUNO]: 0,
    };
    for (const contagem of contagens) {
      usuariosPorPerfil[contagem.perfil] = contagem._count._all;
    }
    return usuariosPorPerfil;
  }

  private async validarContaExiste(contaId: number) {
    const conta = await this.contasRepositories.buscarPorId(contaId);
    if (!conta) {
      throw new NotFoundException('Conta não encontrada');
    }
    return conta;
  }
}
