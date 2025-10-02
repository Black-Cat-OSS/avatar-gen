import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { YamlConfigService } from '../../../config/yaml-config.service';
import { IDatabaseConnection, DatabaseInfo } from '../interfaces';

/**
 * Сервис для работы с SQLite базой данных
 *
 * Реализует интерфейс IDatabaseConnection для SQLite.
 * Предоставляет механизмы подключения с повторными попытками,
 * проверки состояния и переподключения.
 *
 * ⚠️ Важно: Этот сервис НЕ инициализируется автоматически.
 * Инициализация контролируется DatabaseService (Facade),
 * который вызывает onModuleInit() только для выбранного провайдера.
 *
 * 💡 URL базы данных задается программно через datasourceUrl,
 * без использования переменных окружения.
 *
 * @class SqliteDatabaseService
 * @implements {IDatabaseConnection}
 */
@Injectable()
export class SqliteDatabaseService implements IDatabaseConnection {
  private readonly config: Record<string, unknown>;
  private isConnected = false;
  private logger: Logger;
  private _prisma: PrismaClient;
  private readonly databaseFilePath: string;

  constructor(private readonly configService: YamlConfigService) {
    const config = configService.getConfig();

    // Проверяем наличие обязательного параметра URL базы данных
    const sqliteParams = (config as { app: { database: { sqlite_params: { url: string } } } }).app
      .database.sqlite_params;
    if (!sqliteParams?.url) {
      throw new Error(
        'SQLite database URL is required in configuration. Please check settings.yaml file.',
      );
    }

    const databaseUrl = sqliteParams.url;

    // Извлекаем путь к файлу из URL (формат: file:./path/to/db.sqlite)
    this.databaseFilePath = this.extractFilePathFromUrl(databaseUrl);

    this._prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    });

    // Устанавливаем переменную окружения для консистентности (может потребоваться Prisma в других местах)
    process.env.DATABASE_URL = databaseUrl;

    this.config = config;
    this.logger = new Logger(SqliteDatabaseService.name);
    this.logger.debug(`SQLite datasource URL: ${databaseUrl}`);
    this.logger.debug(`SQLite database file path: ${this.databaseFilePath}`);
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }

  /**
   * Извлекает путь к файлу из URL SQLite
   *
   * @param {string} url - URL в формате file:./path/to/db.sqlite
   * @returns {string} Путь к файлу базы данных
   * @private
   */
  private extractFilePathFromUrl(url: string): string {
    // Убираем префикс "file:" из URL
    let filePath = url.replace(/^file:/, '');

    // Преобразуем относительный путь в абсолютный
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath);
    }

    return filePath;
  }

  /**
   * Проверяет существование файла базы данных и директории
   *
   * @throws {Error} Если файл или директория не существуют, или нет прав доступа
   * @private
   */
  private checkDatabaseFileExists(): void {
    const dbDirectory = path.dirname(this.databaseFilePath);

    // Проверяем существование директории
    if (!fs.existsSync(dbDirectory)) {
      const errorMessage = [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '❌ SQLite Database Error: Directory does not exist',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        `📁 Expected directory: ${dbDirectory}`,
        '',
        '📝 Solution:',
        `   Create the directory manually or update the database path in settings.yaml`,
        '',
        '   Example commands:',
        `   mkdir -p "${dbDirectory}"`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ].join('\n');

      this.logger.error(errorMessage);
      throw new Error(`SQLite database directory does not exist: ${dbDirectory}`);
    }

    // Проверяем существование файла базы данных
    if (!fs.existsSync(this.databaseFilePath)) {
      const errorMessage = [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '❌ SQLite Database Error: Database file does not exist',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        `📂 Expected file: ${this.databaseFilePath}`,
        '',
        '📝 Solution:',
        '   1. Run Prisma migrations to create the database:',
        '      npm run prisma:migrate',
        '',
        '   2. Or create an empty database file:',
        `      touch "${this.databaseFilePath}"`,
        '',
        '   3. Then run migrations:',
        '      npm run prisma:migrate',
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ].join('\n');

      this.logger.error(errorMessage);
      throw new Error(`SQLite database file does not exist: ${this.databaseFilePath}`);
    }

    // Проверяем права на чтение/запись
    try {
      fs.accessSync(this.databaseFilePath, fs.constants.R_OK | fs.constants.W_OK);
    } catch {
      const errorMessage = [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '❌ SQLite Database Error: Insufficient permissions',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        `📂 Database file: ${this.databaseFilePath}`,
        '',
        '📝 Solution:',
        '   Grant read/write permissions to the database file:',
        `   chmod 666 "${this.databaseFilePath}"`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ].join('\n');

      this.logger.error(errorMessage);
      throw new Error(
        `Insufficient permissions for SQLite database file: ${this.databaseFilePath}`,
      );
    }

    this.logger.log(`✅ SQLite database file exists and is accessible: ${this.databaseFilePath}`);
  }

  /**
   * Подключение к SQLite базе данных с повторными попытками
   *
   * @param {number} retryCount - текущий номер попытки
   * @returns {Promise<void>}
   * @throws {Error} Если все попытки подключения исчерпаны
   */
  private async connectWithRetry(retryCount = 1): Promise<void> {
    const { maxRetries, retryDelay } = (
      this.config as {
        app: { database: { connection: { maxRetries: number; retryDelay: number } } };
      }
    ).app.database.connection;

    // Проверяем существование файла базы данных перед первой попыткой подключения
    if (retryCount === 1) {
      this.checkDatabaseFileExists();
    }

    try {
      await this._prisma.$connect();
      this.isConnected = true;
      this.logger.log(`SQLite database connected successfully on attempt ${retryCount}`);
    } catch (error) {
      this.logger.error(`SQLite database connection attempt ${retryCount} failed`, error);

      if (retryCount < maxRetries) {
        this.logger.warn(
          `Retrying SQLite database connection in ${retryDelay}ms... (${retryCount}/${maxRetries})`,
        );
        await this.delay(retryDelay);
        return this.connectWithRetry(retryCount + 1);
      }

      this.logger.error(`SQLite database connection failed after ${maxRetries} attempts`);
      throw new Error(
        `SQLite database connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Задержка выполнения
   *
   * @param {number} ms - количество миллисекунд
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      try {
        await this._prisma.$disconnect();
        this.isConnected = false;
        this.logger.log('SQLite database disconnected successfully');
      } catch (error) {
        this.logger.error('Failed to disconnect from SQLite database', error);
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('SQLite database is not connected');
      return false;
    }

    try {
      await this._prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('SQLite database health check failed', error);
      this.isConnected = false;
      return false;
    }
  }

  getDatabaseInfo(): DatabaseInfo {
    return {
      driver: 'sqlite',
      connected: this.isConnected,
      config: (this.config as { app: { database: Record<string, unknown> } }).app.database,
    };
  }

  async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to SQLite database...');
    this.isConnected = false;
    await this.connectWithRetry();
  }
}
