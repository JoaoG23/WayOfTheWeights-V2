import { IsDateString, IsOptional } from 'class-validator';
import { FiltroUsuarioDto } from '../../../shared/dto/filtro-usuario.dto';

// Query de GET /conclusoes: período opcional (inicio inclusivo, fim
// exclusivo, em ISO 8601) e ?usuarioId= (administrador/treinador).
export class FiltroConclusoesDto extends FiltroUsuarioDto {
  @IsOptional()
  @IsDateString({}, { message: 'inicio deve ser uma data ISO 8601' })
  inicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fim deve ser uma data ISO 8601' })
  fim?: string;
}
