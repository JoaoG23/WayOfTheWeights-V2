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
  console.log('[Testcontainers] Sincronizando schema do Prisma...');

  // Roda o push do prisma para criar as tabelas no container efêmero
  // Utiliza o DATABASE_URL recém exportado no env
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('[Testcontainers] Schema sincronizado. Iniciando testes...');
};
