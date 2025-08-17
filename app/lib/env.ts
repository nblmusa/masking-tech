import { z } from 'zod';

export const envSchema = z.object({
  // ... other environment variables ...
  
  // RapidAPI Configuration
  RAPIDAPI_KEY: z.string({
    required_error: 'RapidAPI key is required for car background removal service',
  }),
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
