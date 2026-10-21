import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env.local first (if present), then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().default('file:./dev.db'),
  CORS_ORIGIN: z.string().default('*'),
  GOOGLE_API_KEY: z.string().optional(),
  GEMMA_API_KEY: z.string().optional(),
  GEMMA_MODEL_NAME: z.string().optional(),
  GEMMA_API_BASE: z.string().optional(),
  GEMMA_TIMEOUT_SECONDS: z.coerce.number().optional().default(6.0),
  NEMOTRON_BASE_URL: z.string().optional(),
  NEMOTRON_API_KEY: z.string().optional(),
  NEMOTRON_MODEL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
