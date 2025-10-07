import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Avatar } from './entities/avatar.entity';
import { YamlConfigService } from '../../config/yaml-config.service';

/**
 * Основной сервис для работы с базой данных через TypeORM
 *
 * Предоставляет единый интерфейс для работы с базой данных,
 * используя TypeORM Repository pattern. Автоматически работает
 * с любым настроенным драйвером базы данных (PostgreSQL, SQLite).
 *
 * @class DatabaseService
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly dataSource: DataSource,
    private readonly configService: YamlConfigService,
  ) {}

  /**
   * Инициализация сервиса
   */
  async onModuleInit(): Promise<void> {
    try {
      // Проверяем подключение к базе данных
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const driver = this.configService.getConfig().app.database.driver;
      this.logger.log(`🗄️  DatabaseService initialized - ${driver} provider active`);
    } catch (error) {
      this.logger.error(`DatabaseService initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Очистка ресурсов при уничтожении модуля
   */
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.logger.log('Database connection closed');
      }
    } catch (error) {
      this.logger.error(`Error closing database connection: ${error.message}`);
    }
  }

  /**
   * Получение репозитория для работы с аватарами
   */
  get avatar(): Repository<Avatar> {
    return this.avatarRepository;
  }

  /**
   * Проверка состояния подключения к базе данных
   *
   * @returns {Promise<boolean>} true если подключение активно, false в противном случае
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Получение информации о подключенной базе данных
   *
   * @returns {object} Объект с информацией о типе драйвера и статусе подключения
   */
  getDatabaseInfo(): { driver: string; isConnected: boolean; databaseName?: string } {
    const config = this.configService.getConfig();
    const driver = config.app.database.driver;
    
    return {
      driver,
      isConnected: this.dataSource.isInitialized,
      databaseName: config.app.database.network?.database || config.app.database.sqlite_params?.url,
    };
  }

  /**
   * Принудительное переподключение к базе данных
   *
   * @returns {Promise<void>}
   */
  async reconnect(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
      await this.dataSource.initialize();
      this.logger.log('Database reconnected successfully');
    } catch (error) {
      this.logger.error(`Database reconnection failed: ${error.message}`);
      throw error;
    }
  }
}