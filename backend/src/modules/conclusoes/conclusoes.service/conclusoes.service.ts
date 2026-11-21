import { BadRequestException, Injectable } from '@nestjs/common';
import { ConclusoesRepositories } from '../conclusoes.repositories/conclusoes.repositories';
import { CriarConclusaoDto } from '../conclusoes.dto/criar-conclusao.dto';
import { FiltroConclusoesDto } from '../conclusoes.dto/filtro-conclusoes.dto';
import { ConclusaoRespostaDto } from '../conclusoes.dto/conclusao-resposta.dto';
import { TreinosService } from '../../treinos/treinos.service/treinos.service';
import { SubtreinosService } from '../../subtreinos/subtreinos.service/subtreinos.service';
import { ExerciciosService } from '../../exercicios/exercicios.service/exercicios.service';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { resolverUsuarioIdAlvo } from '../../auth/regras/acesso-usuario';

type ConclusaoComExercicios = {
  id: number;
  usuarioId: number;
  subtreinoId: number | null;
  tituloTreino: string;
  tituloSubtreino: string;
  concluidoEm: Date;
  exercicios: { nome: string; cargaKg: number }[];
};

@Injectable()
export class ConclusoesService {
  constructor(
    private readonly conclusoesRepositories: ConclusoesRepositories,
    private readonly treinosService: TreinosService,
    private readonly subtreinosService: SubtreinosService,
    private readonly exerciciosService: ExerciciosService,
  ) {}

  // Registra a conclusão só quando TODOS os exercícios do subtreino foram
  // marcados. A conclusão pertence ao dono do treino.
  async criar(
    usuarioAutenticado: PayloadJwt,
    treinoId: number,
    subtreinoId: number,
    dadosConclusao: CriarConclusaoDto,
  ): Promise<ConclusaoRespostaDto> {
    const treino = await this.treinosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
    );
    const subtreino = await this.subtreinosService.buscarPorId(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
    );
    const exercicios = await this.exerciciosService.listarPorSubtreino(
      usuarioAutenticado,
      treinoId,
      subtreinoId,
    );
    this.validarTodosExerciciosMarcados(
      exercicios.map((exercicio) => exercicio.id),
      dadosConclusao.exerciciosConcluidosIds,
    );

    const conclusaoCriada = await this.conclusoesRepositories.criar({
      usuarioId: treino.usuarioId,
      subtreinoId,
      tituloTreino: treino.titulo,
      tituloSubtreino: subtreino.titulo,
      exercicios: exercicios.map((exercicio) => ({
        nome: exercicio.nome,
        cargaKg: exercicio.cargaAtual,
      })),
    });
    return this.paraResposta(conclusaoCriada);
  }

  async listar(
    usuarioAutenticado: PayloadJwt,
    filtro: FiltroConclusoesDto,
  ): Promise<ConclusaoRespostaDto[]> {
    const usuarioIdAlvo = resolverUsuarioIdAlvo(
      usuarioAutenticado,
      filtro.usuarioId,
    );
    const conclusoes =
      await this.conclusoesRepositories.listarPorUsuarioNaConta(
        usuarioAutenticado.contaId,
        usuarioIdAlvo,
        {
          inicio: filtro.inicio ? new Date(filtro.inicio) : undefined,
          fim: filtro.fim ? new Date(filtro.fim) : undefined,
        },
      );
    return conclusoes.map((conclusao) => this.paraResposta(conclusao));
  }

  private validarTodosExerciciosMarcados(
    idsDoSubtreino: number[],
    idsMarcados: number[],
  ) {
    if (idsDoSubtreino.length === 0) {
      throw new BadRequestException('Este subtreino não tem exercícios');
    }

    const marcados = new Set(idsMarcados);
    const idsDesconhecidos = [...marcados].filter(
      (id) => !idsDoSubtreino.includes(id),
    );
    if (idsDesconhecidos.length > 0) {
      throw new BadRequestException(
        'A lista contém exercícios que não são deste subtreino',
      );
    }

    const faltantes = idsDoSubtreino.filter((id) => !marcados.has(id));
    if (faltantes.length > 0) {
      throw new BadRequestException(
        `Marque todos os exercícios para concluir o treino (faltam ${faltantes.length})`,
      );
    }
  }

  // Mantém o contrato da API: a carga sai como cargaAtual (kg), como nos
  // exercícios.
  private paraResposta(
    conclusao: ConclusaoComExercicios,
  ): ConclusaoRespostaDto {
    return {
      id: conclusao.id,
      usuarioId: conclusao.usuarioId,
      subtreinoId: conclusao.subtreinoId,
      tituloTreino: conclusao.tituloTreino,
      tituloSubtreino: conclusao.tituloSubtreino,
      concluidoEm: conclusao.concluidoEm,
      exercicios: conclusao.exercicios.map((exercicio) => ({
        nome: exercicio.nome,
        cargaAtual: exercicio.cargaKg,
      })),
    };
  }
}
