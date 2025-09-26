import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    save_path: z.string().min(1, 'Save path is required'),
    server: z.object({
      host: z.string().default('localhost'),
      port: z.number().min(1).max(65535).default(3000),
    }),
    database: z.object({
      driver: z.literal('sqlite'),
      sqlite_params: z.object({
        url: z.string().min(1, 'Database URL is required'),
      }),
    }),
  }),
});

export type Configuration = z.infer<typeof configSchema>;

export const validateConfig = (config: unknown): Configuration => {
  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      );
      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

