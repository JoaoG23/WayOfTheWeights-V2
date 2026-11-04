import { IsEmail } from 'class-validator';

export class SolicitarCodigoDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
