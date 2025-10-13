import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { YamlConfigService } from '../../../config/modules/yaml-driver/yaml-config.service';
import { Configuration } from '../../../config/config.schema';

/**
 * Сервис для инициализации директорий приложения на основе настроек
 *
 * Читает настройки из settings.yaml и создает директории, указанные в конфигурации.
 * Обеспечивает правильную структуру файловой системы для хранения данных.
 * Расширяем для поддержки новых настроек без изменения кода.
 *
 * @class DirectoryInitializerService
 * @implements {OnModuleInit}
 */
@Injectable()
export class DirectoryInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DirectoryInitializerService.name);
  private readonly config: Configuration;

  constructor(private readonly configService: YamlConfigService) {
    this.config = this.configService.getConfig();
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Initializing application directories from configuration...');

      const cwd = process.cwd();
      this.logger.debug(`Current working directory: ${cwd}`);

      this.logger.debug('Extracting directories from configuration');
      const directoriesToCreate = this.extractDirectoriesFromConfig();
      this.logger.debug(
        `Found ${directoriesToCreate.length} directories to create: ${JSON.stringify(directoriesToCreate, null, 2)}`,
      );

      this.logger.debug('Creating directories');
      await this.ensureDirectoriesExist(directoriesToCreate);

      this.logger.log(`Successfully initialized ${directoriesToCreate.length} directories`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize directories: ${error.message}`,
        error.stack,
        'DirectoryInitializer',
      );
      throw error;
    }
  }

  /**
   * Извлечение директорий из конфигурации
   *
   * Анализирует settings.yaml и извлекает все пути директорий,
   * которые используются приложением.
   *
   * @private
   * @returns {string[]} Массив путей директорий для создания
   */
  private extractDirectoriesFromConfig(): string[] {
    const directories = new Set<string>();

    this.extractStorageDirectories(directories);
    this.extractDatabaseDirectories(directories);
    this.extractLogDirectories(directories);
    this.addAdditionalDirectories(directories);

    return Array.from(directories).sort();
  }

  /**
   * Извлечение директорий хранилища из настроек
   *
   * @private
   * @param {Set<string>} directories - Множество для добавления директорий
   */
  private extractStorageDirectories(directories: Set<string>): void {
    this.logger.debug('Extracting storage directories from config');

    const storageConfig = this.config.app?.storage;
    if (storageConfig?.type === 'local' && storageConfig.local?.save_path) {
      this.logger.debug(`Avatar save path: ${storageConfig.local.save_path}`);
      const avatarDir = dirname(storageConfig.local.save_path);
      this.logger.debug(`Avatar directory: ${avatarDir}`);

      if (avatarDir && avatarDir !== '.') {
        directories.add(avatarDir);
        this.logger.debug(`Added avatar directory: ${avatarDir}`);
      } else {
        this.logger.warn(`Invalid avatar directory path: ${avatarDir}`);
      }
    } else {
      this.logger.warn('No avatar save path configured in settings');
    }

    directories.add('storage');
    this.logger.debug('Added root storage directory');
  }

  /**
   * Извлечение директорий базы данных из настроек
   *
   * @private
   * @param {Set<string>} directories - Множество для добавления директорий
   */
  private extractDatabaseDirectories(directories: Set<string>): void {
    this.logger.debug('Extracting database directories from config');

    const dbDriver = this.config.app?.database?.driver;
    this.logger.debug(`Database driver: ${dbDriver}`);

    if (dbDriver === 'sqlite' && this.config.app?.database?.sqlite_params?.url) {
      const sqliteUrl = this.config.app.database.sqlite_params.url;
      this.logger.debug(`SQLite URL: ${sqliteUrl}`);

      if (sqliteUrl.startsWith('file:')) {
        const filePath = sqliteUrl.replace('file:', '');
        this.logger.debug(`SQLite file path: ${filePath}`);

        const dbDir = dirname(filePath);
        this.logger.debug(`SQLite directory: ${dbDir}`);

        if (dbDir && dbDir !== '.') {
          directories.add(dbDir);
          this.logger.debug(`Added SQLite database directory: ${dbDir}`);
        } else {
          this.logger.warn(`Invalid database directory path: ${dbDir}`);
        }
      } else {
        this.logger.warn(`Invalid SQLite URL format: ${sqliteUrl}`);
      }
      //FIXME: It`s look seem bad
    } else if (dbDriver === 'sqlite') {
      this.logger.debug('SQLite driver selected but no configuration found');
    } else if (dbDriver === 'postgresql') {
      this.logger.debug('PostgreSQL driver selected - no local directories needed');
    } else {
      this.logger.debug(
        `Database driver '${dbDriver}' does not require local directory initialization`,
      );
    }
  }

  /**
   * Извлечение директорий логов из настроек
   *
   * @private
   * @param {Set<string>} directories - Множество для добавления директорий
   */
  private extractLogDirectories(directories: Set<string>): void {
    // Директория для логов
    directories.add('logs');
  }

  /**
   * Добавление дополнительных директорий
   *
   * @private
   * @param {Set<string>} directories - Множество для добавления директорий
   */
  private addAdditionalDirectories(directories: Set<string>): void {
    // Добавляем корневые директории для безопасности
    directories.add('storage');
    directories.add('logs');

    // Добавляем поддиректории storage
    directories.add('storage/avatars');
    directories.add('storage/database');
  }

  /**
   * Проверяет и создает директории из списка
   *
   * @private
   * @param {string[]} directories - Массив путей директорий
   * @returns {Promise<void>}
   */
  private async ensureDirectoriesExist(directories: string[]): Promise<void> {
    for (const dirPath of directories) {
      await this.ensureDirectoryExists(dirPath);
    }
  }

  /**
   * Проверяет существование директории и создает её если необходимо
   *
   * @private
   * @param {string} dirPath - Путь к директории
   * @returns {Promise<void>}
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      // Проверяем, существует ли директория
      await fs.access(dirPath);
      this.logger.debug(`Directory exists: ${dirPath}`);
    } catch {
      // Директория не существует, создаем её
      this.logger.debug(`Creating directory: ${dirPath}`);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.log(`✓ Created directory: ${dirPath}`);
      } catch (createError: unknown) {
        this.logger.error(`Failed to create directory ${dirPath}`, createError);
        throw createError;
      }
    }
  }

  /**
   * Получение информации о статусе директорий
   *
   * @returns {Promise<DirectoryStatus>} Объект с информацией о статусе директорий
   */
  async getDirectoryStatus(): Promise<DirectoryStatus> {
    const directories = this.extractDirectoriesFromConfig();
    const status: DirectoryStatus = {};

    for (const dirPath of directories) {
      try {
        const stats = await fs.stat(dirPath);
        status[dirPath] = {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      } catch (error) {
        status[dirPath] = {
          exists: false,
          error: error.message,
        };
      }
    }

    return status;
  }

  /**
   * Принудительное создание всех директорий заново
   *
   * @returns {Promise<void>}
   */
  async recreateDirectories(): Promise<void> {
    this.logger.warn('Recreating all directories...');

    try {
      const directories = this.extractDirectoriesFromConfig();

      // Удаляем существующие директории (осторожно!)
      await this.removeExistingDirectories(directories);

      // Создаем заново
      await this.ensureDirectoriesExist(directories);

      this.logger.log('All directories recreated successfully');
    } catch (error) {
      this.logger.error('Failed to recreate directories', error);
      throw error;
    }
  }

  /**
   * Удаление существующих директорий (используется осторожно)
   *
   * @private
   * @param {string[]} directories - Массив путей директорий для удаления
   * @returns {Promise<void>}
   */
  private async removeExistingDirectories(directories: string[]): Promise<void> {
    for (const dirPath of directories.reverse()) {
      try {
        // Проверяем, что директория не пустая и не является критической
        if (dirPath !== '.' && dirPath !== '..' && dirPath !== '/' && dirPath !== '\\') {
          await fs.rm(dirPath, { recursive: true, force: true });
          this.logger.debug(`Removed directory: ${dirPath}`);
        }
      } catch (error: unknown) {
        // Игнорируем ошибки удаления (директория может не существовать)
        this.logger.debug(
          `Could not remove directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}

/**
 * Статус директорий приложения
 *
 * @interface DirectoryStatus
 */
export interface DirectoryStatus {
  [key: string]: {
    exists: boolean;
    size?: number;
    created?: Date;
    modified?: Date;
    error?: string;
  };
}
