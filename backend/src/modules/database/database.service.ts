import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { YamlConfigService } from '../../config/yaml-config.service';
import { IDatabaseConnection, DatabaseInfo } from './interfaces';
import { DatabaseDriver } from './constants/database.constants';

/**
 * Основной сервис для управления подключениями к базам данных
 *
 * Выступает в роли фасада (Facade Pattern) для работы с базой данных.
 * Делегирует все вызовы активному провайдеру, который выбирается на основе конфигурации.
 *
 * Отвечает за:
 * - Управление жизненным циклом подключения
 * - Делегирование операций активному провайдеру
 * - Предоставление единого интерфейса для работы с БД
 *
 * ⚠️ Важно: Создается только ОДИН провайдер на основе конфигурации.
 * Неиспользуемые провайдеры не создаются и не инициализируются.
 *
 * @class DatabaseService
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly config: Record<string, unknown>;
  private readonly activeConnection: IDatabaseConnection;
  private readonly driver: DatabaseDriver;

  constructor(
    private readonly configService: YamlConfigService,
    activeProvider: IDatabaseConnection,
  ) {
    this.config = this.configService.getConfig();
    this.driver = (this.config as { app: { database: { driver: string } } }).app.database
      .driver as DatabaseDriver;
    this.activeConnection = activeProvider;

    this.logger.log(`Database service initialized with driver: ${this.driver}`);
  }

  /**
   * Получение активного подключения к базе данных
   *
   * Возвращает PrismaClient активной реализации для прямого доступа к БД.
   *
   * @returns {IDatabaseConnection} Активное подключение
   */
  getConnection(): IDatabaseConnection {
    return this.activeConnection;
  }

  /**
   * Получение типа активного драйвера
   *
   * @returns {DatabaseDriver} Тип драйвера
   */
  getDriver(): DatabaseDriver {
    return this.driver;
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log(`Initializing ${this.driver} database connection...`);
      await this.activeConnection.onModuleInit();
      this.logger.log(`${this.driver} database connection established successfully`);
    } catch (error) {
      this.logger.error(
        `${this.driver} database connection failed: ${error.message}`,
        error.stack,
        'DatabaseService',
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log(`Destroying ${this.driver} database connection...`);
    await this.activeConnection.onModuleDestroy();
  }

  async healthCheck(): Promise<boolean> {
    return await this.activeConnection.healthCheck();
  }

  getDatabaseInfo(): DatabaseInfo {
    return this.activeConnection.getDatabaseInfo();
  }

  async reconnect(): Promise<void> {
    this.logger.log(`Reconnecting to ${this.driver} database...`);
    await this.activeConnection.reconnect();
  }

  /**
   * Прямой доступ к методам Prisma Client
   *
   * Все методы делегируются активному подключению
   */
  get $connect() {
    return this.activeConnection.prisma.$connect.bind(this.activeConnection.prisma);
  }

  get $disconnect() {
    return this.activeConnection.prisma.$disconnect.bind(this.activeConnection.prisma);
  }

  get $queryRaw() {
    return this.activeConnection.prisma.$queryRaw.bind(this.activeConnection.prisma);
  }

  get $queryRawUnsafe() {
    return this.activeConnection.prisma.$queryRawUnsafe.bind(this.activeConnection.prisma);
  }

  get $executeRaw() {
    return this.activeConnection.prisma.$executeRaw.bind(this.activeConnection.prisma);
  }

  get $executeRawUnsafe() {
    return this.activeConnection.prisma.$executeRawUnsafe.bind(this.activeConnection.prisma);
  }

  get $transaction() {
    return this.activeConnection.prisma.$transaction.bind(this.activeConnection.prisma);
  }

  get $on() {
    return this.activeConnection.prisma.$on.bind(this.activeConnection.prisma);
  }

  get $extends() {
    return this.activeConnection.prisma.$extends.bind(this.activeConnection.prisma);
  }

  /**
   * Делегирование доступа к моделям Prisma
   *
   * Все модели доступны через геттеры для прозрачного делегирования
   */
  get avatar() {
    return this.activeConnection.prisma.avatar;
  }

  /**
   * Делегирование других методов Prisma Client при необходимости
   *
   * Добавьте дополнительные геттеры для моделей по мере необходимости
   */
}
