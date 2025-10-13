import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigMergerService } from '../config-merger.service';

describe('ConfigMergerService', () => {
  let service: ConfigMergerService;

  beforeEach(() => {
    service = new ConfigMergerService();
  });

  describe('deepMerge', () => {
    it('should merge simple objects', () => {
      const base = { a: 1, b: 2 };
      const override = { b: 3, c: 4 };

      const result = service.deepMerge(base, override);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
      const base = { app: { server: { port: 3000 } } };
      const override = { app: { server: { host: 'localhost' } } };

      const result = service.deepMerge(base, override);

      expect(result).toEqual({
        app: {
          server: {
            port: 3000,
            host: 'localhost',
          },
        },
      });
    });

    it('should not merge arrays (override replaces)', () => {
      const base = { arr: [1, 2, 3] };
      const override = { arr: [4, 5] };

      const result = service.deepMerge(base, override);

      expect(result).toEqual({ arr: [4, 5] });
    });

    it('should handle deep nested objects', () => {
      const base = {
        app: {
          database: {
            connection: {
              maxRetries: 3,
              retryDelay: 1000,
            },
          },
        },
      };

      const override = {
        app: {
          database: {
            connection: {
              maxRetries: 5,
            },
          },
        },
      };

      const result = service.deepMerge(base, override);

      expect(result).toEqual({
        app: {
          database: {
            connection: {
              maxRetries: 5,
              retryDelay: 1000,
            },
          },
        },
      });
    });

    it('should handle null and undefined values', () => {
      const base = { a: 1, b: null, c: undefined };
      const override = { b: 2, c: 3 };

      const result = service.deepMerge(base, override);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.c).toBe(3);
    });

    it('should not mutate original objects', () => {
      const base = { app: { server: { port: 3000 } } };
      const override = { app: { server: { host: 'localhost' } } };

      const result = service.deepMerge(base, override);

      expect(base).toEqual({ app: { server: { port: 3000 } } });
      expect(override).toEqual({ app: { server: { host: 'localhost' } } });
      expect(result).not.toBe(base);
    });
  });
});
