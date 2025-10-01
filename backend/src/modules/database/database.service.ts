import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { YamlConfigService } from '../../config/yaml-config.service';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly config: any;
  private isConnected = false;

  constructor(private readonly configService: YamlConfigService) {
    super();
    this.config = this.configService.getConfig();
  }

  /**
   * Подключение к базе данных с повторными попытками
   * @param retryCount - текущий номер попытки
   */
  private async connectWithRetry(retryCount = 1): Promise<void> {
    const { maxRetries, retryDelay } = this.config.app.database.connection;
    
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log(`Database connected successfully on attempt ${retryCount}`);
    } catch (error) {
      this.logger.error(`Database connection attempt ${retryCount} failed`, error);
      
      if (retryCount < maxRetries) {
        this.logger.warn(`Retrying database connection in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
        await this.delay(retryDelay);
        return this.connectWithRetry(retryCount + 1);
      }
      
      this.logger.error(`Database connection failed after ${maxRetries} attempts`);
      throw new Error(`Database connection failed after ${maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * Задержка выполнения
   * @param ms - количество миллисекунд
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Database disconnected successfully');
      } catch (error) {
        this.logger.error('Failed to disconnect from database', error);
      }
    }
  }

  /**
   * Проверка состояния подключения к базе данных
   * @returns true если подключение активно, false в противном случае
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn('Database is not connected');
      return false;
    }

    try {
      // Используем разные запросы для разных типов БД
      const driver = this.config.app.database.driver;
      if (driver === 'sqlite') {
        await this.$queryRaw`SELECT 1`;
      } else if (driver === 'postgresql') {
        await this.$queryRaw`SELECT 1`;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Получение информации о подключенной базе данных
   * @returns объект с информацией о БД
   */
  getDatabaseInfo(): { driver: string; connected: boolean; config: any } {
    return {
      driver: this.config.app.database.driver,
      connected: this.isConnected,
      config: this.config.app.database,
    };
  }

  /**
   * Принудительное переподключение к базе данных
   */
  async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to database...');
    this.isConnected = false;
    await this.connectWithRetry();
  }
}

