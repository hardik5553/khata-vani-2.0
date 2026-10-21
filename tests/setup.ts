import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Use a separate test database
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Remove any existing test database before running
try {
  require('fs').unlinkSync('./test.db');
} catch {
  // ignore if not exists
}

// Run migrations against the test database
try {
  execSync('npx prisma migrate deploy', { cwd: process.cwd(), stdio: 'pipe' });
} catch {
  // If migrations fail, push the schema directly.
  // test.db is deleted above, so this targets a fresh, empty database;
  // --accept-data-loss is intentionally not used.
  try {
    execSync('npx prisma db push', { cwd: process.cwd(), stdio: 'pipe' });
  } catch (e) {
    console.error('Failed to set up test database:', e);
  }
}

export const prisma = new PrismaClient();
