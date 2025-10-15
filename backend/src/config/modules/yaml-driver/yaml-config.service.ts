import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { join } from 'path';
import { Configuration } from '../../config.schema';
import { ConfigurationBuilder } from './builders/configuration.builder';
import { YamlFileStrategy } from './strategies/yaml-file.strategy';
import { findConfigDirectory } from './utils/find-base-config';

/**
 * Сервис для загрузки YAML конфигурации
 *
 * Использует паттерны проектирования:
 * - **Strategy Pattern**: YamlFileStrategy создает план построения конфигурации
 * - **Builder Pattern**: ConfigurationBuilder выполняет план и строит конфигурацию
 *
 * Pipeline:
 * 1. findBaseConfig() находит settings.yaml
 * 2. Strategy создает BuildPlan (какие файлы загружать)
 * 3. Builder выполняет план (загружает и сливает файлы)
 * 4. Валидация через Zod схему
 * 5. Готовая Configuration сохраняется
 * 6. Builder и Strategy уничтожаются (одноразовое использование)
 *
 * @see {@link ConfigurationBuilder} для логики построения
 * @see {@link YamlFileStrategy} для создания плана загрузки
 */
@Injectable()
export class YamlConfigService implements OnModuleDestroy {
  private readonly logger = new Logger(YamlConfigService.name);
  private readonly config: Configuration;

  constructor(
    private readonly builder: ConfigurationBuilder,
    private readonly strategy: YamlFileStrategy,
  ) {
    this.config = this.loadConfig();
  }

  /**
   * Загружает конфигурацию один раз при создании сервиса
   * После загрузки builder и strategy становятся ненужными
   *
   * @returns Валидированная конфигурация
   * @throws Error если конфигурация не найдена или невалидна
   */
  private loadConfig(): Configuration {
    try {
      // Находим директорию с конфигурационными файлами
      const configDir = findConfigDirectory();
      this.logger.log(`Configuration directory: ${configDir}`);

      // Строим конфигурацию используя Strategy + Builder
      // Strategy найдет все существующие файлы в директории
      const configuration = this.builder
        .setStrategy(this.strategy)
        .setBasePath(join(configDir, 'settings.yaml')) // Для совместимости с dirname()
        .setEnvironment(process.env.NODE_ENV)
        .buildWithStrategy()
        .validate()
        .build();

      this.logger.log('Configuration loaded successfully');
      return configuration;
    } catch (error) {
      this.logger.error(`Failed to load configuration: ${error.message}`, error.stack);
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  onModuleDestroy() {
    // Builder и Strategy уничтожаются автоматически
    this.logger.debug('Configuration service destroyed');
  }

  getConfig(): Configuration {
    return this.config;
  }

  getStorageConfig() {
    return this.config.app.storage;
  }

  getServerConfig() {
    return this.config.app.server;
  }

  getDatabaseConfig() {
    return this.config.app.database;
  }

  getLoggingConfig() {
    return this.config.app.logging;
  }

  getCorsConfig() {
    return {
      enabled: this.config.app.cors || false,
      origins: this.config.app.corsEnabled || [],
    };
  }
}
