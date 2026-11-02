import { Controller, Get, Query } from '@nestjs/common';
import { EstatisticasService } from '../estatisticas.service/estatisticas.service';
import { UsuarioAutenticado } from '../../auth/decorators/usuario-autenticado.decorator';
import { PayloadJwt } from '../../auth/tipos/payload-jwt';
import { FiltroUsuarioDto } from '../../../shared/dto/filtro-usuario.dto';

@Controller('estatisticas')
export class EstatisticasController {
  constructor(private readonly estatisticasService: EstatisticasService) {}

  @Get('resumo')
  async resumoEvolucao(
    @UsuarioAutenticado() usuarioAutenticado: PayloadJwt,
    @Query() filtro: FiltroUsuarioDto,
  ) {
    return this.estatisticasService.resumoEvolucao(
      usuarioAutenticado,
      filtro.usuarioId,
    );
  }
}
