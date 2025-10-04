import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { Configuration, validateConfig } from './configuration';

@Injectable()
export class YamlConfigService {
  private readonly logger = new Logger(YamlConfigService.name);
  private config: Configuration;

  constructor() {
    this.loadConfig();
  }

  private deepMerge<T>(base: T, override: Partial<T>): T {
    const result = { ...base };

    for (const key in override) {
      if (Object.prototype.hasOwnProperty.call(override, key)) {
        const baseValue = result[key];
        const overrideValue = override[key];

        if (
          baseValue &&
          overrideValue &&
          typeof baseValue === 'object' &&
          typeof overrideValue === 'object' &&
          !Array.isArray(baseValue) &&
          !Array.isArray(overrideValue)
        ) {
          result[key] = this.deepMerge(baseValue, overrideValue);
        } else {
          result[key] = overrideValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Обрабатывает переменные окружения в YAML контенте
   * Поддерживает синтаксис: ${VARIABLE_NAME:-default_value}
   */
  private processEnvironmentVariables(content: string): string {
    return content.replace(/\$\{([^}:]+)(:-[^}]*)?\}/g, (match, varName, defaultValue) => {
      const envValue = process.env[varName];
      
      if (envValue !== undefined) {
        return envValue;
      }
      
      // Если есть значение по умолчанию, используем его
      if (defaultValue && defaultValue.startsWith(':-')) {
        return defaultValue.substring(2); // Убираем ':-'
      }
      
      // Если переменная не найдена и нет значения по умолчанию, возвращаем пустую строку
      return '';
    });
  }

  private loadConfig(): void {
    try {
      // Загружаем основной файл конфигурации
      // Поддержка двух путей: для Docker (/app/) и для локальной разработки (project_root/backend/)
      let baseConfigPath = process.env.CONFIG_PATH;

      if (!baseConfigPath) {
        const dockerPath = join(process.cwd(), 'settings.yaml');
        const localPath = join(process.cwd(), 'backend', 'settings.yaml');

        // Проверяем Docker путь первым (если файл в корне - мы в Docker)
        if (existsSync(dockerPath)) {
          baseConfigPath = dockerPath;
        } else if (existsSync(localPath)) {
          baseConfigPath = localPath;
        } else {
          baseConfigPath = localPath; // Fallback для ошибки
        }
      }

      this.logger.debug(`Looking for configuration file at: ${baseConfigPath}`);

      if (!existsSync(baseConfigPath)) {
        this.logger.error(`Base configuration file not found: ${baseConfigPath}`);
        throw new Error(`Base configuration file not found: ${baseConfigPath}`);
      }

      this.logger.log(`Loading base configuration from: ${baseConfigPath}`);
      const baseFileContents = readFileSync(baseConfigPath, 'utf8');
      this.logger.debug(
        `Configuration file contents length: ${baseFileContents.length} characters`,
      );

      const processedContents = this.processEnvironmentVariables(baseFileContents);
      const baseConfig = yaml.load(processedContents);
      this.logger.debug(`Base configuration loaded: ${JSON.stringify(baseConfig, null, 2)}`);

      let finalConfig = baseConfig;
      this.logger.debug(`Initial configuration: ${JSON.stringify(baseConfig, null, 2)}`);

      // Загружаем локальную конфигурацию (settings.local.yaml)
      const baseDir = baseConfigPath.includes('/backend/')
        ? join(process.cwd(), 'backend')
        : process.cwd();

      const localConfigPath = join(baseDir, 'settings.local.yaml');
      this.logger.debug(`Looking for local config at: ${localConfigPath}`);

      if (existsSync(localConfigPath)) {
        this.logger.log(`Loading local configuration from: ${localConfigPath}`);
        const localFileContents = readFileSync(localConfigPath, 'utf8');
        this.logger.debug(
          `Local config file contents length: ${localFileContents.length} characters`,
        );

        const processedLocalContents = this.processEnvironmentVariables(localFileContents);
        const localConfig = yaml.load(processedLocalContents);
        this.logger.debug(
          `Local configuration loaded: ${JSON.stringify(localConfig, null, 2)}`,
        );

        // Объединяем конфигурации, где localConfig переопределяет baseConfig
        finalConfig = this.deepMerge(finalConfig, localConfig);
        this.logger.log(`Local configuration loaded and merged successfully`);
        this.logger.debug(`After local merge configuration: ${JSON.stringify(finalConfig, null, 2)}`);
      } else {
        this.logger.debug('Local configuration file not found, using base configuration only');
      }

      // Если определен NODE_ENV, пытаемся загрузить среду-специфичную конфигурацию
      const nodeEnv = process.env.NODE_ENV;
      this.logger.debug(`Current NODE_ENV: ${nodeEnv}`);

      if (nodeEnv && ['development', 'production', 'test'].includes(nodeEnv)) {
        // Определяем базовую директорию из baseConfigPath
        const baseDir = baseConfigPath.includes('/backend/')
          ? join(process.cwd(), 'backend')
          : process.cwd();

        const envConfigPath = join(baseDir, `settings.${nodeEnv}.yaml`);
        this.logger.debug(`Looking for environment config at: ${envConfigPath}`);

        if (existsSync(envConfigPath)) {
          this.logger.log(`Loading environment-specific configuration from: ${envConfigPath}`);
          const envFileContents = readFileSync(envConfigPath, 'utf8');
          this.logger.debug(
            `Environment config file contents length: ${envFileContents.length} characters`,
          );

          const processedEnvContents = this.processEnvironmentVariables(envFileContents);
          const envConfig = yaml.load(processedEnvContents);
          this.logger.debug(
            `Environment configuration loaded: ${JSON.stringify(envConfig, null, 2)}`,
          );

          // Объединяем конфигурации, где envConfig переопределяет baseConfig
          finalConfig = this.deepMerge(baseConfig, envConfig);
          this.logger.log(`Environment-specific configuration loaded and merged successfully`);
          this.logger.debug(`Final merged configuration: ${JSON.stringify(finalConfig, null, 2)}`);
        } else {
          this.logger.warn(
            `Environment-specific configuration file not found: ${envConfigPath}, using base configuration only`,
          );
        }

        // Загружаем локальную среду-специфичную конфигурацию (settings.{NODE_ENV}.local.yaml)
        const envLocalConfigPath = join(baseDir, `settings.${nodeEnv}.local.yaml`);
        this.logger.debug(`Looking for environment local config at: ${envLocalConfigPath}`);

        if (existsSync(envLocalConfigPath)) {
          this.logger.log(`Loading environment-specific local configuration from: ${envLocalConfigPath}`);
          const envLocalFileContents = readFileSync(envLocalConfigPath, 'utf8');
          this.logger.debug(
            `Environment local config file contents length: ${envLocalFileContents.length} characters`,
          );

          const processedEnvLocalContents = this.processEnvironmentVariables(envLocalFileContents);
          const envLocalConfig = yaml.load(processedEnvLocalContents);
          this.logger.debug(
            `Environment local configuration loaded: ${JSON.stringify(envLocalConfig, null, 2)}`,
          );

          // Объединяем конфигурации, где envLocalConfig переопределяет все предыдущие
          finalConfig = this.deepMerge(finalConfig, envLocalConfig);
          this.logger.log(`Environment-specific local configuration loaded and merged successfully`);
          this.logger.debug(`Final configuration after all merges: ${JSON.stringify(finalConfig, null, 2)}`);
        } else {
          this.logger.debug('Environment-specific local configuration file not found');
        }
      } else {
        this.logger.debug('No valid NODE_ENV set, using base configuration only');
      }

      this.logger.debug('Validating configuration...');
      this.config = validateConfig(finalConfig);
      this.logger.log('Configuration loaded and validated successfully');
    } catch (error) {
      this.logger.error(
        `Failed to load configuration: ${error.message}`,
        error.stack,
        'YamlConfigService',
      );
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  getConfig(): Configuration {
    return this.config;
  }

  /**
   * @deprecated Use getStorageConfig() instead
   */
  getSavePath(): string {
    if (this.config.app.storage.type === 'local') {
      return this.config.app.storage.local?.save_path || './storage/avatars';
    }
    this.logger.warn(
      'getSavePath() called but storage type is not local. This method is deprecated.',
    );
    return './storage/avatars';
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
}
