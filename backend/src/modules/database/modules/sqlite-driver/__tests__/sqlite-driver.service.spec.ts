import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SqliteDriverService } from '../sqlite-driver.service';
import { YamlConfigService } from '../../../../../config/modules/yaml-driver/yaml-config.service';
import { vi } from 'vitest';

describe('SqliteDriverService', () => {
  let service: SqliteDriverService;
  let mockYamlConfigService: any;

  beforeEach(async () => {
    const mockYamlConfigServiceValue = {
      getDatabaseConfig: vi.fn(),
      getLoggingConfig: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqliteDriverService,
        {
          provide: YamlConfigService,
          useValue: mockYamlConfigServiceValue,
        },
      ],
    }).compile();

    service = module.get<SqliteDriverService>(SqliteDriverService);
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
    expect(service.getDriverName()).toBe('sqlite');
  });

  describe('buildConfigs', () => {
    it('should build SQLite configuration successfully', () => {
      const mockDatabaseConfig = {
        driver: 'sqlite' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        sqlite_params: {
          url: 'file:./test.db',
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
        type: 'sqlite',
        entities: [],
        synchronize: true,
        logging: true,
        logger: 'simple-console',
        sqlite: {
          databasePath: './test.db',
        },
      });
    });

    it('should throw error when SQLite URL is missing', () => {
      const mockDatabaseConfig = {
        driver: 'sqlite' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        sqlite_params: null,
      };

      mockYamlConfigService.getDatabaseConfig.mockReturnValue(mockDatabaseConfig);

      expect(() => {
        service.buildConfigs(mockYamlConfigService);
      }).toThrow('SQLite database URL is required in configuration');
    });

    it('should handle file URL format correctly', () => {
      const mockDatabaseConfig = {
        driver: 'sqlite' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        sqlite_params: {
          url: 'file:/absolute/path/to/database.db',
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

      expect(result.sqlite?.databasePath).toBe('/absolute/path/to/database.db');
      expect(result.logging).toBe(false);
    });

    it('should handle relative path correctly', () => {
      const mockDatabaseConfig = {
        driver: 'sqlite' as const,
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        sqlite_params: {
          url: 'file:./data/test.db',
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

      expect(result.sqlite?.databasePath).toBe('./data/test.db');
      expect(result.synchronize).toBe(true);
    });
  });
});
