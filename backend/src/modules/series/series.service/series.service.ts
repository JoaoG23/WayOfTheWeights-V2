import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesRepositories } from '../series.repositories/series.repositories';
import { CriarSerieDto } from '../series.dto/criar-serie.dto';
import { AtualizarSerieDto } from '../series.dto/atualizar-serie.dto';
import { SerieRespostaDto } from '../series.dto/serie-resposta.dto';
import { ExerciciosService } from '../../exercicios/exercicios.service/exercicios.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';

@Injectable()
export class SeriesService {
  constructor(
    private readonly seriesRepositories: SeriesRepositories,
    private readonly exerciciosService: ExerciciosService,
  ) {}

  async criar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    exercicioId: number,
    dadosSerie: CriarSerieDto,
  ): Promise<SerieRespostaDto> {
    await this.exerciciosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
    );

    return this.seriesRepositories.criar({
      exercicioId,
      repeticoes: dadosSerie.repeticoes,
    });
  }

  async listarPorExercicio(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    exercicioId: number,
  ): Promise<SerieRespostaDto[]> {
    await this.exerciciosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
    );
    return this.seriesRepositories.listarPorExercicio(exercicioId);
  }

  async atualizar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    exercicioId: number,
    id: number,
    dadosSerie: AtualizarSerieDto,
  ): Promise<SerieRespostaDto> {
    await this.validarSerieExiste(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
      id,
    );
    return this.seriesRepositories.atualizarRepeticoes(
      id,
      dadosSerie.repeticoes,
    );
  }

  async remover(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    exercicioId: number,
    id: number,
  ): Promise<void> {
    await this.validarSerieExiste(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
      id,
    );
    await this.seriesRepositories.remover(id);
  }

  // O acesso ao treino/exercício (conta e dono) é validado pelo
  // ExerciciosService; aqui só se garante que a série é daquele exercício.
  private async validarSerieExiste(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    exercicioId: number,
    id: number,
  ) {
    await this.exerciciosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
      exercicioId,
    );

    const serie = await this.seriesRepositories.buscarPorId(id);
    if (!serie || serie.exercicioId !== exercicioId) {
      throw new NotFoundException('Série não encontrada neste exercício');
    }
    return serie;
  }
}
