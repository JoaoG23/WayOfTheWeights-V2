import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

// Query ?usuarioId= das rotas de dados de treino. Só tem efeito para
// ADMINISTRADOR e TREINADOR, restrito à própria conta (ver
// resolverUsuarioIdAlvo); para o ALUNO é ignorado.
export class FiltroUsuarioDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'usuarioId deve ser um número inteiro' })
  usuarioId?: number;
}
