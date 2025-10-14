import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Migration } from 'typeorm';
import { Avatar } from '../avatar/avatar.entity';
import { YamlConfigService } from '../../config/modules/yaml-driver/yaml-config.service';

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
      if (!this.dataSource.isInitialized) {
        this.logger.log('Initializing database connection...');
        await this.dataSource.initialize();
        this.logger.log('Database connection established');
      }

      const driver = this.configService.getConfig().app.database.driver;
      this.logger.log(`DatabaseService initialized - ${driver} provider active`);
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

  /**
   * Запуск всех ожидающих миграций
   * @returns массив примененных миграций
   */
  async runMigrations(): Promise<Migration[]> {
    try {
      this.logger.log('Running database migrations...');
      const migrations = await this.dataSource.runMigrations();
      
      if (migrations.length === 0) {
        this.logger.log('No pending migrations found');
      } else {
        this.logger.log(`Applied ${migrations.length} migrations:`);
        migrations.forEach(migration => {
          this.logger.log(`  - ${migration.name}`);
        });
      }
      
      return migrations;
    } catch (error) {
      this.logger.error(`Migration execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Откат последней миграции
   */
  async revertLastMigration(): Promise<void> {
    try {
      this.logger.log('Reverting last migration...');
      await this.dataSource.undoLastMigration();
      this.logger.log('Last migration reverted successfully');
    } catch (error) {
      this.logger.error(`Migration revert failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получение статуса миграций
   * @returns информация о выполненных и ожидающих миграциях
   */
  async getMigrationStatus(): Promise<{
    executed: unknown[];
    pending: boolean;
  }> {
    try {
      const executedMigrations = await this.dataSource.query(
        'SELECT * FROM migrations ORDER BY timestamp'
      );
      
      const pendingMigrations = await this.dataSource.showMigrations();
      
      return {
        executed: executedMigrations,
        pending: pendingMigrations,
      };
    } catch (error) {
      this.logger.error(`Failed to get migration status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация новой миграции
   * @param name имя миграции
   * @returns путь к созданному файлу миграции
   */
  async generateMigration(name: string): Promise<string> {
    try {
      this.logger.log(`Generating migration: ${name}`);
      // Используем TypeORM CLI для генерации миграции
      // Этот метод будет реализован позже, когда понадобится
      throw new Error('Migration generation not implemented yet');
    } catch (error) {
      this.logger.error(`Migration generation failed: ${error.message}`);
      throw error;
    }
  }
}
