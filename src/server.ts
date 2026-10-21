import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();
const port = env.PORT;

const server = app.listen(port, async () => {
  console.log(`[Khata Vani] Server running on http://localhost:${port}`);
  console.log(`[Khata Vani] Frontend Web App: http://localhost:${port}`);
  console.log(`[Khata Vani] Health check: http://localhost:${port}/health`);
  console.log(`[Khata Vani] API base: http://localhost:${port}/api/v1`);
  console.log(`[Khata Vani] Environment: ${env.NODE_ENV}`);

  // Verify the database connection is reachable
  try {
    await prisma.$connect();
    console.log(`[Khata Vani] Database connected (${env.DATABASE_URL})`);
  } catch (err) {
    console.error('[Khata Vani] Database connection failed:', err instanceof Error ? err.message : err);
    console.error('[Khata Vani] Ensure the schema has been applied (npm run prisma:db-push or npm run prisma:migrate).');
    process.exit(1);
  }
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Khata Vani] Port ${port} is already in use.`);
  } else {
    console.error('[Khata Vani] Server failed to start:', err.message);
  }
  process.exit(1);
});

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`[Khata Vani] Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[Khata Vani] Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Khata Vani] Error during shutdown:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error('[Khata Vani] Forced exit after graceful shutdown timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err: unknown) => {
  console.error('[Khata Vani] Unhandled rejection:', err instanceof Error ? err.message : err);
});

process.on('uncaughtException', (err: Error) => {
  console.error('[Khata Vani] Uncaught exception:', err.message);
  process.exit(1);
});

export { app, server };
