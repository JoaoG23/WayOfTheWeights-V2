import { Injectable, NotFoundException } from '@nestjs/common';
import { TreinosRepositories } from '../treinos.repositories/treinos.repositories';
import { CriarTreinoDto } from '../treinos.dto/criar-treino.dto';
import { AtualizarTreinoDto } from '../treinos.dto/atualizar-treino.dto';
import { TreinoRespostaDto } from '../treinos.dto/treino-resposta.dto';
import { UsuariosService } from '../../usuarios/usuarios.service/usuarios.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import {
  podeAcessarRecursoDoUsuario,
  resolverUsuarioIdAlvo,
} from '../../auth/regras/acesso-usuario';

@Injectable()
export class TreinosService {
  constructor(
    private readonly treinosRepositories: TreinosRepositories,
    private readonly usuariosService: UsuariosService,
  ) {}

  async criar(
    usuarioAutenticado: PayloadJwt,
    dadosTreino: CriarTreinoDto,
  ): Promise<TreinoRespostaDto> {
    const usuarioIdAlvo = resolverUsuarioIdAlvo(
      usuarioAutenticado,
      dadosTreino.usuarioId,
    );
    // Garante que o usuário alvo existe e é da mesma conta.
    if (usuarioIdAlvo !== usuarioAutenticado.sub) {
      await this.usuariosService.buscarPorId(
        usuarioAutenticado.contaId,
        usuarioIdAlvo,
      );
    }

    return this.treinosRepositories.criar({
      usuarioId: usuarioIdAlvo,
      titulo: dadosTreino.titulo,
      descricao: dadosTreino.descricao,
    });
  }

  async listar(
    usuarioAutenticado: PayloadJwt,
    usuarioIdInformado?: number,
  ): Promise<TreinoRespostaDto[]> {
    const usuarioIdAlvo = resolverUsuarioIdAlvo(
      usuarioAutenticado,
      usuarioIdInformado,
    );
    return this.treinosRepositories.listarPorUsuarioNaConta(
      usuarioAutenticado.contaId,
      usuarioIdAlvo,
    );
  }

  async buscarPorId(
    usuarioAutenticado: PayloadJwt,
    id: number,
  ): Promise<TreinoRespostaDto> {
    return this.validarTreinoAcessivel(usuarioAutenticado, id);
  }

  async atualizar(
    usuarioAutenticado: PayloadJwt,
    id: number,
    dadosTreino: AtualizarTreinoDto,
  ): Promise<TreinoRespostaDto> {
    await this.validarTreinoAcessivel(usuarioAutenticado, id);
    return this.treinosRepositories.atualizar(id, {
      titulo: dadosTreino.titulo,
      descricao: dadosTreino.descricao,
    });
  }

  async remover(usuarioAutenticado: PayloadJwt, id: number): Promise<void> {
    await this.validarTreinoAcessivel(usuarioAutenticado, id);
    await this.treinosRepositories.remover(id);
  }

  // Treino de outra conta, ou de outro usuário quando quem pede é aluno,
  // responde 404 (e não 403), para não revelar que o id existe.
  private async validarTreinoAcessivel(
    usuarioAutenticado: PayloadJwt,
    id: number,
  ) {
    const treino = await this.treinosRepositories.buscarPorIdNaConta(
      usuarioAutenticado.contaId,
      id,
    );
    if (
      !treino ||
      !podeAcessarRecursoDoUsuario(usuarioAutenticado, treino.usuarioId)
    ) {
      throw new NotFoundException('Treino não encontrado');
    }
    return treino;
  }
}
