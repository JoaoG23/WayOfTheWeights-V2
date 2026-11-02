import { Injectable } from '@nestjs/common';
import { EstatisticasRepositories } from '../estatisticas.repositories/estatisticas.repositories';
import { ResumoEvolucaoExercicioDto } from '../estatisticas.dto/resumo-evolucao-resposta.dto';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { resolverUsuarioIdAlvo } from '../../auth/regras/acesso-usuario';

@Injectable()
export class EstatisticasService {
  constructor(
    private readonly estatisticasRepositories: EstatisticasRepositories,
  ) {}

  async resumoEvolucao(
    usuarioAutenticado: PayloadJwt,
    usuarioIdInformado?: number,
  ): Promise<ResumoEvolucaoExercicioDto[]> {
    const usuarioIdAlvo = resolverUsuarioIdAlvo(
      usuarioAutenticado,
      usuarioIdInformado,
    );
    const exercicios =
      await this.estatisticasRepositories.listarExerciciosComCargaInicial(
        usuarioAutenticado.contaId,
        usuarioIdAlvo,
      );

    return exercicios.map((exercicio) => {
      const cargaInicial =
        exercicio.historicoCargas[0]?.carga ?? exercicio.cargaAtual;
      const evolucaoCarga = this.arredondar(
        exercicio.cargaAtual - cargaInicial,
      );

      return {
        exercicioId: exercicio.id,
        nomeExercicio: exercicio.nome,
        treinoId: exercicio.treino.id,
        tituloTreino: exercicio.treino.titulo,
        cargaInicial,
        cargaAtual: exercicio.cargaAtual,
        evolucaoCarga,
        evolucaoPercentual:
          cargaInicial === 0
            ? null
            : this.arredondar((evolucaoCarga / cargaInicial) * 100),
        quantidadeRegistros: exercicio._count.historicoCargas,
      };
    });
  }

  private arredondar(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
