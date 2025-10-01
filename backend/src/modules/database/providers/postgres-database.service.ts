import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { YamlConfigService } from '../../../config/yaml-config.service';
import { IDatabaseConnection, DatabaseInfo } from '../interfaces';

/**
 * Сервис для работы с PostgreSQL базой данных
 *
 * Реализует интерфейс IDatabaseConnection для PostgreSQL.
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
 * @class PostgresDatabaseService
 * @implements {IDatabaseConnection}
 */
@Injectable()
export class PostgresDatabaseService implements IDatabaseConnection {
  private readonly config: Record<string, unknown>;
  private isConnected = false;
  private logger: Logger;
  private _prisma: PrismaClient;

  constructor(private readonly configService: YamlConfigService) {
    // Вычисляем все параметры до создания PrismaClient
    const config = configService.getConfig();
    const postgresParams = (
      config as { app: { database: { postgresql_params: Record<string, unknown> } } }
    ).app.database.postgresql_params;
    const databaseUrl = this.buildPostgresUrl(postgresParams);

    // Устанавливаем переменную окружения для Prisma
    process.env.DATABASE_URL = databaseUrl;

    this._prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    });

    this.config = config;
    this.logger = new Logger(PostgresDatabaseService.name);
    // Не логируем URL целиком (может содержать пароль)
    console.debug(
      `PostgreSQL datasource configured for host: ${(postgresParams as { host: string }).host}:${(postgresParams as { port: number }).port}`,
    );
  }

  get prisma(): PrismaClient {
    return this._prisma;
  }

  /**
   * Построение URL подключения к PostgreSQL из параметров конфигурации
   *
   * @param {object} params - Параметры подключения из конфигурации
   * @returns {string} URL в формате postgresql://user:password@host:port/database?ssl=true
   * @private
   */
  private buildPostgresUrl(params: Record<string, unknown>): string {
    const {
      username = 'postgres',
      password = '',
      host = 'localhost',
      port = 5432,
      database = 'avatar_gen',
      ssl = false,
    } = params || {};

    // Формируем строку подключения
    let url = `postgresql://${username}`;

    if (password) {
      url += `:${password}`;
    }

    url += `@${host}:${port}/${database}`;

    // Добавляем SSL параметр если включен
    if (ssl) {
      url += '?sslmode=require';
    }

    return url;
  }

  /**
   * Подключение к PostgreSQL базе данных с повторными попытками
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
      this.logger.log(`PostgreSQL database connected successfully on attempt ${retryCount}`);
    } catch (error) {
      this.logger.error(`PostgreSQL database connection attempt ${retryCount} failed`, error);

      if (retryCount < maxRetries) {
        this.logger.warn(
          `Retrying PostgreSQL database connection in ${retryDelay}ms... (${retryCount}/${maxRetries})`,
        );
        await this.delay(retryDelay);
        return this.connectWithRetry(retryCount + 1);
      }

      this.logger.error(`PostgreSQL database connection failed after ${maxRetries} attempts`);
      throw new Error(
        `PostgreSQL database connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`,
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
        this.logger.log('PostgreSQL database disconnected successfully');
      } catch (error) {
        this.logger.error('Failed to disconnect from PostgreSQL database', error);
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('PostgreSQL database is not connected');
      return false;
    }

    try {
      await this._prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('PostgreSQL database health check failed', error);
      this.isConnected = false;
      return false;
    }
  }

  getDatabaseInfo(): DatabaseInfo {
    return {
      driver: 'postgresql',
      connected: this.isConnected,
      config: (this.config as { app: { database: Record<string, unknown> } }).app.database,
    };
  }

  async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to PostgreSQL database...');
    this.isConnected = false;
    await this.connectWithRetry();
  }
}
