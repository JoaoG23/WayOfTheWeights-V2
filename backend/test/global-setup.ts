import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

export default async () => {
  console.log('\n[Testcontainers] Iniciando PostgreSQL...');

  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  const databaseUrl = container.getConnectionUri();

  // Disponibiliza o container para o teardown
  (global as any).__DB_CONTAINER__ = container;

  // Disponibiliza a URI para o Prisma Service durante os testes
  process.env.DATABASE_URL = databaseUrl;

  // Segredo do JWT usado apenas nos testes e2e
  process.env.JWT_SECRET = 'segredo-de-teste-e2e';

  console.log(`[Testcontainers] Conectado em ${databaseUrl}`);
  console.log('[Testcontainers] Aplicando migrations do Prisma...');

  // Aplica as migrations reais (e não db push) porque elas também populam
  // dados de referência, como o catálogo de cargas de 1 a 1500 kg.
  // Utiliza o DATABASE_URL recém exportado no env.
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('[Testcontainers] Migrations aplicadas. Iniciando testes...');
};
