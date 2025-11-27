import { z } from 'zod';

/**
 * Environment variables schema with validation
 * Application will crash on startup if required variables are missing
 */
const envSchema = z.object({
  // OAuth Configuration
  OAUTH_CLIENT_ID: z.string().min(1, 'OAUTH_CLIENT_ID is required'),
  OAUTH_CLIENT_SECRET: z.string().min(1, 'OAUTH_CLIENT_SECRET is required'),
  OAUTH_AUTHORIZE_URL: z
    .string()
    .url('OAUTH_AUTHORIZE_URL must be a valid URL'),
  OAUTH_TOKEN_URL: z.string().url('OAUTH_TOKEN_URL must be a valid URL'),
  OAUTH_REDIRECT_URI: z.string().url('OAUTH_REDIRECT_URI must be a valid URL'),
  OAUTH_SCOPE: z.string().default('openid profile email'),

  // Server Configuration
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Redis (optional - falls back to in-memory store)
  REDIS_URL: z.string().url().optional(),

  // API Configuration
  BELTCHE_API_BASE_URL: z.string().url().default('https://beltche.com/api/v1'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      console.error(`\n❌ Environment validation failed:\n${issues}\n`);
      console.error(
        '💡 Copy .env.example to .env and fill in the required values.\n'
      );
      process.exit(1);
    }
    throw error;
  }
}

export const env = loadEnv();

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
