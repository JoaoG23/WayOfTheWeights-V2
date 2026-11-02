import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { helmetConfig } from './security/helmet.config';
import { corsConfig } from './security/cors.config';

// Configuração única da aplicação, usada no main.ts e nos testes e2e para
// que os testes rodem com o mesmo pipeline (cookies, CORS, validação) da
// produção.
export function configurarAplicacao(app: INestApplication) {
  app.use(helmetConfig);
  app.use(cookieParser());
  app.enableCors(corsConfig);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
