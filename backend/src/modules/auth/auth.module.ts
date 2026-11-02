import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller/auth.controller';
import { AuthService } from './auth.service/auth.service';
import { AuthRepositories } from './auth.repositories/auth.repositories';
import { CriptografiaModule } from '../../shared/criptografia/criptografia.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TEMPO_EXPIRACAO_TOKEN_SEGUNDOS } from './constantes/expiracao-token';

@Module({
  imports: [
    CriptografiaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: TEMPO_EXPIRACAO_TOKEN_SEGUNDOS },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepositories,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
