import { z } from 'zod';

export const envSchema = z.object({
  // ... other environment variables ...
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
}
