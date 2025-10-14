import { Injectable, Logger } from '@nestjs/common';
import { dirname, join } from 'path';
import { Configuration, validateConfig } from '../../../config.schema';
import { FileReaderService } from '../services/file-reader.service';
import { ConfigMergerService } from '../services/config-merger.service';
import { IConfigLoadingStrategy } from '../types/config-loading.strategy.interface';
import { ConfigContext } from '../types/config-context.interface';

/**
 * Builder для построения конфигурации
 * Получает план от Strategy и выполняет его
 * Паттерн Builder (Строитель)
 */
@Injectable()
export class ConfigurationBuilder {
  private readonly logger = new Logger(ConfigurationBuilder.name);
  private context: ConfigContext;
  private strategy?: IConfigLoadingStrategy;

  constructor(
    private readonly fileReader: FileReaderService,
    private readonly configMerger: ConfigMergerService,
  ) {
    this.reset();
  }

  /**
   * Сбрасывает состояние builder'а
   */
  reset(): void {
    this.context = {
      baseDir: '',
      currentConfig: {},
      logger: this.logger,
    };
    this.strategy = undefined;
  }

  /**
   * Устанавливает стратегию загрузки
   */
  setStrategy(strategy: IConfigLoadingStrategy): this {
    this.strategy = strategy;
    return this;
  }

  /**
   * Устанавливает базовый путь к файлу конфигурации
   */
  setBasePath(path: string): this {
    this.context.baseDir = dirname(path);
    return this;
  }

  /**
   * Устанавливает окружение
   */
  setEnvironment(env?: string): this {
    this.context.nodeEnv = env;
    return this;
  }

  /**
   * Строит конфигурацию используя план от стратегии
   * Strategy создает план, Builder выполняет его
   */
  buildWithStrategy(): this {
    if (!this.strategy) {
      throw new Error('Strategy not set');
    }

    // Получаем план построения от стратегии
    const plan = this.strategy.createBuildPlan(this.context.baseDir, this.context.nodeEnv);

    this.logger.log(`Building configuration with ${this.strategy.getName()}`);
    this.logger.debug(`Plan: ${plan.filesToLoad.length} files to load`);

    // Выполняем план: загружаем файлы по порядку
    for (const file of plan.filesToLoad) {
      const filePath = join(plan.baseDir, file.fileName);

      if (this.fileReader.fileExists(filePath)) {
        this.logger.log(`Loading: ${file.fileName}`);

        const config = this.fileReader.readYamlFile(filePath);
        this.context.currentConfig = this.configMerger.deepMerge(
          this.context.currentConfig,
          config,
        );

        this.logger.debug(`Merged: ${file.fileName}`);
      } else if (file.required) {
        throw new Error(`Required file not found: ${file.fileName}`);
      } else {
        this.logger.debug(`Skipping optional file: ${file.fileName}`);
      }
    }

    return this;
  }

  /**
   * Валидирует конфигурацию используя Zod схему
   */
  validate(): this {
    this.logger.debug('Validating configuration...');
    this.context.currentConfig = validateConfig(this.context.currentConfig);
    this.logger.log('Configuration validated successfully');
    return this;
  }

  /**
   * Возвращает готовую конфигурацию и сбрасывает builder
   */
  build(): Configuration {
    const result = this.context.currentConfig as Configuration;
    this.reset(); // Сбрасываем для возможного повторного использования
    return result;
  }
}
