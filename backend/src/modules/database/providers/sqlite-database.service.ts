import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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

  constructor(private readonly configService: YamlConfigService) {
    const config = configService.getConfig();

    // Программно задаем URL базы данных из конфигурации
    const databaseUrl =
      (config as { app: { database: { sqlite_params: { url: string } } } }).app.database
        .sqlite_params?.url || 'file:./storage/database/database.sqlite';

    // Устанавливаем переменную окружения для Prisma
    process.env.DATABASE_URL = databaseUrl;

    this._prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    });

    this.config = config;
    this.logger = new Logger(SqliteDatabaseService.name);
    console.debug(`SQLite datasource URL: ${databaseUrl}`);
  }

  get prisma(): PrismaClient {
    return this._prisma;
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
