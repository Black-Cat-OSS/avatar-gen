import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PostgreSQLDriverService } from '../postgresql-driver.service';
import { YamlConfigService } from '../../../../../config/modules/yaml-driver/yaml-config.service';
import { vi } from 'vitest';

describe('PostgreSQLDriverService', () => {
  let service: PostgreSQLDriverService;
  let mockYamlConfigService: any;

  beforeEach(async () => {
    const mockYamlConfigServiceValue = {
      getDatabaseConfig: vi.fn(),
      getLoggingConfig: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgreSQLDriverService,
        {
          provide: YamlConfigService,
          useValue: mockYamlConfigServiceValue,
        },
      ],
    }).compile();

    service = module.get<PostgreSQLDriverService>(PostgreSQLDriverService);
    mockYamlConfigService = module.get(YamlConfigService);

    // Mock logger to avoid console output during tests
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct driver name', () => {
    expect(service.getDriverName()).toBe('postgresql');
  });

  describe('buildConfigs', () => {
    it('should build PostgreSQL configuration successfully', () => {
      const mockDatabaseConfig = {
        driver: 'postgresql' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        network: {
          host: 'localhost',
          port: 5432,
          username: 'testuser',
          password: 'testpass',
          database: 'testdb',
          ssl: false,
        },
      };

      const mockLoggingConfig = {
        level: 'debug' as const,
        verbose: true,
        pretty: true,
      };

      mockYamlConfigService.getDatabaseConfig.mockReturnValue(mockDatabaseConfig);
      mockYamlConfigService.getLoggingConfig.mockReturnValue(mockLoggingConfig);

      const result = service.buildConfigs(mockYamlConfigService);

      expect(result).toEqual({
        type: 'postgres',
        entities: [],
        synchronize: false,
        logging: true,
        logger: 'simple-console',
        host: 'localhost',
        port: 5432,
        username: 'testuser',
        password: 'testpass',
        database: 'testdb',
        ssl: false,
      });
    });

    it('should throw error when network parameters are missing', () => {
      const mockDatabaseConfig = {
        driver: 'postgresql' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        network: null,
      };

      mockYamlConfigService.getDatabaseConfig.mockReturnValue(mockDatabaseConfig);

      expect(() => {
        service.buildConfigs(mockYamlConfigService);
      }).toThrow('PostgreSQL network parameters are required in configuration');
    });

    it('should handle SSL configuration', () => {
      const mockDatabaseConfig = {
        driver: 'postgresql' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        network: {
          host: 'localhost',
          port: 5432,
          username: 'testuser',
          password: 'testpass',
          database: 'testdb',
          ssl: true,
        },
      };

      const mockLoggingConfig = {
        level: 'debug' as const,
        verbose: false,
        pretty: true,
      };

      mockYamlConfigService.getDatabaseConfig.mockReturnValue(mockDatabaseConfig);
      mockYamlConfigService.getLoggingConfig.mockReturnValue(mockLoggingConfig);

      const result = service.buildConfigs(mockYamlConfigService);

      expect(result.ssl).toBe(true);
      expect(result.logging).toBe(false);
    });
  });
});
