import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubtreinosRepositories } from '../subtreinos.repositories/subtreinos.repositories';
import { CriarSubtreinoDto } from '../subtreinos.dto/criar-subtreino.dto';
import { AtualizarSubtreinoDto } from '../subtreinos.dto/atualizar-subtreino.dto';
import { SubtreinoRespostaDto } from '../subtreinos.dto/subtreino-resposta.dto';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { SUBTREINOS_MAXIMOS_POR_TREINO } from '../../../shared/constantes/limites-subtreino';

@Injectable()
export class SubtreinosService {
  constructor(
    private readonly subtreinosRepositories: SubtreinosRepositories,
    private readonly treinosService: TreinosService,
  ) {}

  async criar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    dadosSubtreino: CriarSubtreinoDto,
  ): Promise<SubtreinoRespostaDto> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    await this.validarLimiteDeSubtreinos(treinoId);

    return this.subtreinosRepositories.criar({
      treinoId,
      titulo: dadosSubtreino.titulo,
      descricao: dadosSubtreino.descricao,
    });
  }

  async listarPorTreino(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
  ): Promise<SubtreinoRespostaDto[]> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    return this.subtreinosRepositories.listarPorTreino(treinoId);
  }

  async buscarPorId(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<SubtreinoRespostaDto> {
    return this.validarSubtreinoExiste(usuarioAutenticado, treinoId, id);
  }

  async atualizar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
    dadosSubtreino: AtualizarSubtreinoDto,
  ): Promise<SubtreinoRespostaDto> {
    await this.validarSubtreinoExiste(usuarioAutenticado, treinoId, id);
    return this.subtreinosRepositories.atualizar(id, {
      titulo: dadosSubtreino.titulo,
      descricao: dadosSubtreino.descricao,
    });
  }

  async remover(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<void> {
    await this.validarSubtreinoExiste(usuarioAutenticado, treinoId, id);
    await this.subtreinosRepositories.remover(id);
  }

  // Público: a importação de subtreinos reaproveita a mesma regra ao criar.
  async validarLimiteDeSubtreinos(treinoId: number) {
    const quantidadeAtual =
      await this.subtreinosRepositories.contarPorTreino(treinoId);
    if (quantidadeAtual >= SUBTREINOS_MAXIMOS_POR_TREINO) {
      throw new ConflictException(
        `Um treino pode ter no máximo ${SUBTREINOS_MAXIMOS_POR_TREINO} subtreinos`,
      );
    }
  }

  // O acesso ao treino (conta e dono) é validado pelo TreinosService; aqui só
  // se garante que o subtreino é daquele treino.
  private async validarSubtreinoExiste(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ) {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);

    const subtreino = await this.subtreinosRepositories.buscarPorId(id);
    if (!subtreino || subtreino.treinoId !== treinoId) {
      throw new NotFoundException('Subtreino não encontrado neste treino');
    }
    return subtreino;
  }
}
