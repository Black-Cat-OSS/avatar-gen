import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    save_path: z.string().min(1, 'Save path is required'),
    server: z.object({
      host: z.string().default('localhost'),
      port: z.number().min(1).max(65535).default(3000),
    }),
    database: z.object({
      driver: z.enum(['sqlite', 'postgresql']),
      connection: z.object({
        maxRetries: z.number().min(1).max(10).default(3),
        retryDelay: z.number().min(100).max(10000).default(2000),
      }),
      sqlite_params: z.object({
        url: z.string().min(1, 'Database URL is required'),
      }).optional(),
      postgresql_params: z.object({
        host: z.string().default('localhost'),
        port: z.number().min(1).max(65535).default(5432),
        database: z.string().min(1, 'Database name is required'),
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
        ssl: z.boolean().default(false),
      }).optional(),
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

