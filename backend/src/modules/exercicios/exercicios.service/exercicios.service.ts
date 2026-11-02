import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciciosRepositories } from '../exercicios.repositories/exercicios.repositories';
import { CriarExercicioDto } from '../exercicios.dto/criar-exercicio.dto';
import { AtualizarExercicioDto } from '../exercicios.dto/atualizar-exercicio.dto';
import {
  ExercicioRespostaDto,
  HistoricoCargaRespostaDto,
} from '../exercicios.dto/exercicio-resposta.dto';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Injectable()
export class ExerciciosService {
  constructor(
    private readonly exerciciosRepositories: ExerciciosRepositories,
    private readonly treinosService: TreinosService,
  ) {}

  async criar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    dadosExercicio: CriarExercicioDto,
  ): Promise<ExercicioRespostaDto> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);

    return this.exerciciosRepositories.criarComHistorico({
      treinoId,
      nome: dadosExercicio.nome,
      cargaAtual: dadosExercicio.cargaAtual,
    });
  }

  async listarPorTreino(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
  ): Promise<ExercicioRespostaDto[]> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    return this.exerciciosRepositories.listarPorTreino(treinoId);
  }

  async buscarPorId(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<ExercicioRespostaDto> {
    return this.validarExercicioExiste(usuarioAutenticado, treinoId, id);
  }

  // Só grava histórico quando a carga realmente muda: renomear o exercício
  // ou reenviar a mesma carga não gera ponto novo na evolução.
  async atualizar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
    dadosExercicio: AtualizarExercicioDto,
  ): Promise<ExercicioRespostaDto> {
    const exercicio = await this.validarExercicioExiste(
      usuarioAutenticado,
      treinoId,
      id,
    );

    const cargaAlterada =
      dadosExercicio.cargaAtual !== undefined &&
      dadosExercicio.cargaAtual !== exercicio.cargaAtual;
    if (!cargaAlterada) {
      return this.exerciciosRepositories.atualizarNome(id, dadosExercicio.nome);
    }

    return this.exerciciosRepositories.atualizarCargaComHistorico(id, {
      nome: dadosExercicio.nome,
      cargaAtual: dadosExercicio.cargaAtual,
    });
  }

  async remover(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<void> {
    await this.validarExercicioExiste(usuarioAutenticado, treinoId, id);
    await this.exerciciosRepositories.remover(id);
  }

  async listarHistoricoCargas(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<HistoricoCargaRespostaDto[]> {
    await this.validarExercicioExiste(usuarioAutenticado, treinoId, id);
    return this.exerciciosRepositories.listarHistoricoCargas(id);
  }

  private async validarExercicioExiste(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ) {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);

    const exercicio = await this.exerciciosRepositories.buscarPorId(id);
    if (!exercicio || exercicio.treinoId !== treinoId) {
      throw new NotFoundException('Exercício não encontrado neste treino');
    }
    return exercicio;
  }
}
