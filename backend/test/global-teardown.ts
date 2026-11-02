export default async () => {
  const container = (global as any).__DB_CONTAINER__;
  if (container) {
    console.log('\n[Testcontainers] Derrubando PostgreSQL...');
    await container.stop();
    console.log('[Testcontainers] Container destruído.');
  }
};
