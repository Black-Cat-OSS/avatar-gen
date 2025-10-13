import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '@nestjs/common';
import { ConfigurationBuilder } from '../configuration.builder';
import { FileReaderService } from '../../services/file-reader.service';
import { ConfigMergerService } from '../../services/config-merger.service';
import { YamlFileStrategy } from '../../strategies/yaml-file.strategy';
import { YamlSettingsFinder } from 'find-settings.lib/yaml';

vi.mock('find-settings.lib/yaml');

describe('ConfigurationBuilder', () => {
  let builder: ConfigurationBuilder;
  let fileReader: FileReaderService;
  let configMerger: ConfigMergerService;
  let strategy: YamlFileStrategy;

  beforeEach(() => {
    fileReader = new FileReaderService();
    configMerger = new ConfigMergerService();
    strategy = new YamlFileStrategy();
    builder = new ConfigurationBuilder(fileReader, configMerger);

    vi.clearAllMocks();

    // Подавляем логи в тестах
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('buildWithStrategy', () => {
    it('should execute build plan from strategy', () => {
      const mockConfig = {
        app: {
          server: { host: 'localhost', port: 3000 },
          storage: { type: 'local', local: { save_path: './test' } },
          database: {
            driver: 'sqlite',
            sqlite_params: { url: 'file:test.db' },
            connection: { maxRetries: 3, retryDelay: 1000 },
          },
        },
      };

      // Мокируем YamlSettingsFinder для Strategy
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([
          'settings.yaml',
          'settings.local.yaml',
          'settings.development.yaml',
          'settings.development.local.yaml',
        ]),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);
      vi.spyOn(configMerger, 'deepMerge').mockImplementation((base, override) => ({
        ...base,
        ...override,
      }));

      const config = builder
        .setStrategy(strategy)
        .setBasePath('/config')
        .setEnvironment('development')
        .buildWithStrategy()
        .build();

      expect(config).toBeDefined();
      expect(fileReader.readYamlFile).toHaveBeenCalledTimes(4); // 4 файла в плане
      expect(configMerger.deepMerge).toHaveBeenCalledTimes(4);
    });

    it('should throw error if strategy not set', () => {
      expect(() => {
        builder.setBasePath('/config').buildWithStrategy();
      }).toThrow('Strategy not set');
    });

    it('should throw error if required file not found', () => {
      // Strategy выбросит ошибку если settings.yaml не найден
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([]),
      }) as any);

      expect(() => {
        builder.setStrategy(strategy).setBasePath('/config').buildWithStrategy();
      }).toThrow('Required configuration file not found: settings.yaml');
    });

    it('should skip optional files if not found', () => {
      const mockConfig = {
        app: {
          server: { host: 'localhost', port: 3000 },
          storage: { type: 'local', local: { save_path: './test' } },
          database: {
            driver: 'sqlite',
            sqlite_params: { url: 'file:test.db' },
            connection: { maxRetries: 3, retryDelay: 1000 },
          },
        },
      };

      // Только settings.yaml существует (для Strategy)
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(mockConfig);

      expect(() => {
        builder
          .setStrategy(strategy)
          .setBasePath('/config')
          .setEnvironment('development')
          .buildWithStrategy();
      }).not.toThrow();
    });

    it('should merge multiple files in correct order', () => {
      const baseConfig = { app: { server: { port: 3000 } } };
      const localConfig = { app: { server: { host: 'localhost' } } };

      // Strategy найдет 2 файла (settings.yaml и settings.local.yaml)
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml', 'settings.local.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile')
        .mockReturnValueOnce(baseConfig)
        .mockReturnValueOnce(localConfig);

      vi.spyOn(configMerger, 'deepMerge')
        .mockReturnValueOnce(baseConfig)
        .mockReturnValueOnce({ ...baseConfig, ...localConfig });

      builder
        .setStrategy(strategy)
        .setBasePath('/config')
        .setEnvironment('development')
        .buildWithStrategy();

      expect(configMerger.deepMerge).toHaveBeenCalledTimes(2);
    });
  });

  describe('reset', () => {
    it('should reset builder state', () => {
      builder.setBasePath('/config').setEnvironment('test');
      builder.reset();
      // @ts-ignore
      expect(builder.context.baseDir).toBe('');
      // @ts-ignore
      expect(builder.context.nodeEnv).toBeUndefined();
      // @ts-ignore
      expect(builder.strategy).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should validate the configuration', () => {
      const validConfig = {
        app: {
          server: { host: 'localhost', port: 3000 },
          storage: { type: 'local', local: { save_path: './test' } },
          database: {
            driver: 'sqlite',
            sqlite_params: { url: 'file:test.db' },
            connection: { maxRetries: 3, retryDelay: 1000 },
          },
        },
      };

      // Мокируем YamlSettingsFinder для Strategy
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(validConfig);

      const config = builder
        .setStrategy(strategy)
        .setBasePath('/config')
        .buildWithStrategy()
        .validate()
        .build();

      // Проверяем основные поля (validate добавляет дефолтные значения)
      expect(config.app.server).toEqual(validConfig.app.server);
      expect(config.app.storage).toEqual(validConfig.app.storage);
      expect(config.app.database.driver).toBe('sqlite');
      expect(config.app.logging).toBeDefined(); // Добавляется схемой по умолчанию
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig = {
        app: {
          storage: { type: 'local', local: { save_path: '' } }, // Invalid: empty string
          server: { host: 'localhost', port: 3000 },
          database: {
            driver: 'sqlite',
            sqlite_params: { url: 'file:test.db' },
            connection: { maxRetries: 3, retryDelay: 1000 },
          },
        },
      };

      // Мокируем YamlSettingsFinder для Strategy
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml']),
      }) as any);

      vi.spyOn(fileReader, 'fileExists').mockReturnValue(true);
      vi.spyOn(fileReader, 'readYamlFile').mockReturnValue(invalidConfig);

      expect(() => {
        builder.setStrategy(strategy).setBasePath('/config').buildWithStrategy().validate();
      }).toThrow('Configuration validation failed');
    });
  });
});
