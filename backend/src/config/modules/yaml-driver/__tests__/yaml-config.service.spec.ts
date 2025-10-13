import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '@nestjs/common';
import { YamlConfigService } from '../yaml-config.service';
import { ConfigurationBuilder } from '../builders/configuration.builder';
import { FileReaderService } from '../services/file-reader.service';
import { ConfigMergerService } from '../services/config-merger.service';
import { YamlFileStrategy } from '../strategies/yaml-file.strategy';
import { findConfigDirectory } from '../utils/find-base-config';
import { YamlSettingsFinder } from 'find-settings.lib/yaml';

vi.mock('../utils/find-base-config');
vi.mock('find-settings.lib/yaml');

describe('YamlConfigService', () => {
  const mockConfig = {
    app: {
      server: { host: 'localhost', port: 3000 },
      storage: { type: 'local', local: { save_path: './storage/avatars' } },
      database: {
        driver: 'sqlite',
        sqlite_params: { url: 'file:./storage/database.sqlite' },
        connection: { maxRetries: 3, retryDelay: 2000 },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findConfigDirectory).mockReturnValue('/test');

    // Подавляем логи в тестах
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    const fileReader = new FileReaderService();
    const configMerger = new ConfigMergerService();
    const strategy = new YamlFileStrategy();
    const builder = new ConfigurationBuilder(fileReader, configMerger);

    vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
      find: vi.fn().mockReturnValue(['settings.yaml']),
    }) as any);

    vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
    vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

    const service = new YamlConfigService(builder, strategy);

    expect(service).toBeDefined();
  });

  describe('loadConfig', () => {
    it('should load configuration successfully using Strategy and Builder', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.app.storage.type).toBe('local');
      expect(config.app.server.host).toBe('localhost');
      expect(config.app.server.port).toBe(3000);
    });

    it('should use findConfigDirectory to locate config directory', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      new YamlConfigService(builder, strategy);

      expect(findConfigDirectory).toHaveBeenCalled();
    });

    it('should throw error when configuration file not found', () => {
      vi.mocked(findConfigDirectory).mockImplementation(() => {
        throw new Error('Configuration directory not found');
      });

      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      expect(() => {
        new YamlConfigService(builder, strategy);
      }).toThrow('Configuration directory not found');
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig = {
        app: {
          storage: { type: 'local', local: { save_path: '' } }, // Invalid: empty string
          server: { host: 'localhost', port: 3000 },
          database: {
            driver: 'sqlite',
            sqlite_params: { url: 'file:test.db' },
            connection: { maxRetries: 3, retryDelay: 2000 },
          },
        },
      };

      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(invalidConfig);

      expect(() => {
        new YamlConfigService(builder, strategy);
      }).toThrow();
    });
  });

  describe('getConfig', () => {
    it('should return configuration', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.app).toBeDefined();
    });
  });

  describe('getStorageConfig', () => {
    it('should return storage configuration', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const storageConfig = service.getStorageConfig();

      expect(storageConfig).toBeDefined();
      expect(storageConfig.type).toBe('local');
      expect(storageConfig.local?.save_path).toBe('./storage/avatars');
    });
  });

  describe('getServerConfig', () => {
    it('should return server configuration', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const serverConfig = service.getServerConfig();

      expect(serverConfig).toBeDefined();
      expect(serverConfig.host).toBe('localhost');
      expect(serverConfig.port).toBe(3000);
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configuration', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const databaseConfig = service.getDatabaseConfig();

      expect(databaseConfig).toBeDefined();
      expect(databaseConfig.driver).toBe('sqlite');
      expect(databaseConfig.sqlite_params?.url).toBe('file:./storage/database.sqlite');
    });
  });

  describe('getLoggingConfig', () => {
    it('should return logging configuration with defaults', () => {
      const fileReader = new FileReaderService();
      const configMerger = new ConfigMergerService();
      const strategy = new YamlFileStrategy();
      const builder = new ConfigurationBuilder(fileReader, configMerger);

      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      const service = new YamlConfigService(builder, strategy);
      const loggingConfig = service.getLoggingConfig();

      expect(loggingConfig).toBeDefined();
      expect(loggingConfig.level).toBeDefined();
    });
  });
});
