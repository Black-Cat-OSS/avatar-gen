import { networkSchema } from '../common/schemes';
import { z } from 'zod/v4';

const configSchema = z
  .object({
    app: z.object({
      storage: z.object({
        type: z.enum(['local', 's3']),
        local: z
          .object({
            save_path: z.string().min(1, 'Save path is required for local storage'),
          })
          .optional(),
        s3: z
          .object({
            endpoint: z.url('S3 endpoint must be a valid URL'),
            bucket: z.string().min(1, 'S3 bucket name is required'),
            access_key: z.string().min(1, 'S3 access key is required'),
            secret_key: z.string().min(1, 'S3 secret key is required'),
            region: z.string().default('us-east-1'),
            force_path_style: z.boolean().default(true),
            connection: z.object({
              maxRetries: z.number().min(1).max(10).default(3),
              retryDelay: z.number().min(100).max(10000).default(2000),
            }),
          })
          .optional(),
      }),
      server: networkSchema,
      database: z.object({
        driver: z.enum(['sqlite', 'postgresql']),
        synchronize: z.boolean().default(false).optional(),
        connection: z.object({
          maxRetries: z.number().min(1).max(10).default(3),
          retryDelay: z.number().min(100).max(10000).default(2000),
        }),
        sqlite_params: z
          .object({
            url: z.string().min(1, 'Database URL is required'),
          })
          .optional(),
        network: z
          .object({
            database: z.string().min(1, 'Database name is required'),
            username: z.string().min(1, 'Username is required'),
            password: z.string().min(1, 'Password is required'),
            ssl: z.boolean().default(false),
          })
          .and(networkSchema)
          .optional(),
      }),
      logging: z
        .object({
          level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
          verbose: z.boolean().default(false),
          pretty: z.boolean().default(true),
        })
        .default({
          level: 'info',
          verbose: false,
          pretty: true,
        }),
    }),
  })
  .superRefine((data, ctx) => {
    const storageType = data.app.storage.type;
    if (storageType === 'local' && !data.app.storage.local) {
      ctx.addIssue({
        code: 'custom',
        message: `Storage configuration for type "local" is required`,
        path: ['app', 'storage', 'local'],
      });
    }
    if (storageType === 's3' && !data.app.storage.s3) {
      ctx.addIssue({
        code: 'custom',
        message: `Storage configuration for type "s3" is required`,
        path: ['app', 'storage', 's3'],
      });
    }
  });

export type Configuration = z.infer<typeof configSchema>;

export const validateConfig = (config: unknown): Configuration => {
  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Configuration validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};
