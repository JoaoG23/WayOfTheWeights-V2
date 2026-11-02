import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurarAplicacao } from './app.configuracao';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarAplicacao(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
