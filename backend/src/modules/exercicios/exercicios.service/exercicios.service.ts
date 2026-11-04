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

type ExercicioComCarga = {
  id: number;
  treinoId: number;
  nome: string;
  carga: { valor: number };
  series: { repeticoes: number }[];
  criadoEm: Date;
  atualizadoEm: Date;
};

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

    const exercicioCriado =
      await this.exerciciosRepositories.criarComHistorico({
        treinoId,
        nome: dadosExercicio.nome,
        cargaAtual: dadosExercicio.cargaAtual,
      });
    return this.paraResposta(exercicioCriado);
  }

  async listarPorTreino(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
  ): Promise<ExercicioRespostaDto[]> {
    await this.treinosService.buscarPorId(usuarioAutenticado, treinoId);
    const exercicios =
      await this.exerciciosRepositories.listarPorTreino(treinoId);
    return exercicios.map((exercicio) => this.paraResposta(exercicio));
  }

  async buscarPorId(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    id: number,
  ): Promise<ExercicioRespostaDto> {
    const exercicio = await this.validarExercicioExiste(
      usuarioAutenticado,
      treinoId,
      id,
    );
    return this.paraResposta(exercicio);
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
      dadosExercicio.cargaAtual !== exercicio.carga.valor;
    if (!cargaAlterada) {
      const exercicioRenomeado = await this.exerciciosRepositories.atualizarNome(
        id,
        dadosExercicio.nome,
      );
      return this.paraResposta(exercicioRenomeado);
    }

    const exercicioAtualizado =
      await this.exerciciosRepositories.atualizarCargaComHistorico(id, {
        nome: dadosExercicio.nome,
        cargaAtual: dadosExercicio.cargaAtual,
      });
    return this.paraResposta(exercicioAtualizado);
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
    const historico =
      await this.exerciciosRepositories.listarHistoricoCargas(id);
    return historico.map((registro) => ({
      id: registro.id,
      carga: registro.carga.valor,
      registradoEm: registro.registradoEm,
    }));
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

  // Mantém o contrato da API: a carga sai como número (kg), não como o
  // registro do catálogo.
  private paraResposta(exercicio: ExercicioComCarga): ExercicioRespostaDto {
    return {
      id: exercicio.id,
      treinoId: exercicio.treinoId,
      nome: exercicio.nome,
      cargaAtual: exercicio.carga.valor,
      repeticoesPorSerie: exercicio.series.map((serie) => serie.repeticoes),
      criadoEm: exercicio.criadoEm,
      atualizadoEm: exercicio.atualizadoEm,
    };
  }
}
