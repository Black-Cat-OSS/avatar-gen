import { describe, it, expect } from 'vitest';
import { validateConfig } from '../config.schema';

describe('CORS Configuration Validation', () => {
  it('should validate CORS configuration successfully', () => {
    const config = {
      app: {
        storage: {
          type: 'local' as const,
          local: {
            save_path: './storage/avatars',
          },
        },
        server: {
          host: '0.0.0.0',
          port: 3000,
        },
        database: {
          driver: 'sqlite' as const,
          connection: {
            maxRetries: 3,
            retryDelay: 2000,
          },
          sqlite_params: {
            url: 'file:./storage/database/database.sqlite',
          },
        },
        logging: {
          level: 'info' as const,
          verbose: false,
          pretty: true,
        },
        cors: true,
        corsEnabled: ['172.56.8.1', '34.67.4.9'],
      },
    };

    expect(() => validateConfig(config)).not.toThrow();
    const validatedConfig = validateConfig(config);
    expect(validatedConfig.app.cors).toBe(true);
    expect(validatedConfig.app.corsEnabled).toEqual(['172.56.8.1', '34.67.4.9']);
  });

  it('should allow CORS disabled without corsEnabled', () => {
    const config = {
      app: {
        storage: {
          type: 'local' as const,
          local: {
            save_path: './storage/avatars',
          },
        },
        server: {
          host: '0.0.0.0',
          port: 3000,
        },
        database: {
          driver: 'sqlite' as const,
          connection: {
            maxRetries: 3,
            retryDelay: 2000,
          },
          sqlite_params: {
            url: 'file:./storage/database/database.sqlite',
          },
        },
        logging: {
          level: 'info' as const,
          verbose: false,
          pretty: true,
        },
        cors: false,
      },
    };

    expect(() => validateConfig(config)).not.toThrow();
    const validatedConfig = validateConfig(config);
    expect(validatedConfig.app.cors).toBe(false);
  });

  it('should throw error when CORS enabled but corsEnabled not configured', () => {
    const config = {
      app: {
        storage: {
          type: 'local' as const,
          local: {
            save_path: './storage/avatars',
          },
        },
        server: {
          host: '0.0.0.0',
          port: 3000,
        },
        database: {
          driver: 'sqlite' as const,
          connection: {
            maxRetries: 3,
            retryDelay: 2000,
          },
          sqlite_params: {
            url: 'file:./storage/database/database.sqlite',
          },
        },
        logging: {
          level: 'info' as const,
          verbose: false,
          pretty: true,
        },
        cors: true,
      },
    };

    expect(() => validateConfig(config)).toThrow(
      'You have enabled CORS but not configure \'corsEnabled\' parameter'
    );
  });

  it('should allow CORS enabled with empty corsEnabled array', () => {
    const config = {
      app: {
        storage: {
          type: 'local' as const,
          local: {
            save_path: './storage/avatars',
          },
        },
        server: {
          host: '0.0.0.0',
          port: 3000,
        },
        database: {
          driver: 'sqlite' as const,
          connection: {
            maxRetries: 3,
            retryDelay: 2000,
          },
          sqlite_params: {
            url: 'file:./storage/database/database.sqlite',
          },
        },
        logging: {
          level: 'info' as const,
          verbose: false,
          pretty: true,
        },
        cors: true,
        corsEnabled: [],
      },
    };

    expect(() => validateConfig(config)).not.toThrow();
    const validatedConfig = validateConfig(config);
    expect(validatedConfig.app.cors).toBe(true);
    expect(validatedConfig.app.corsEnabled).toEqual([]);
  });
});
