import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { YamlConfigService } from '../../config/yaml-config.service';
import { SqliteDatabaseService } from './providers/sqlite-database.service';
import { PostgresDatabaseService } from './providers/postgres-database.service';
import { DatabaseService } from './database.service';
import { DatabaseDriver } from './constants/database.constants';

/**
 * Глобальный модуль для работы с базами данных
 *
 * Архитектура модуля:
 * - DatabaseService - основной фасад, управляет выбором и делегированием
 * - SqliteDatabaseService - реализация для SQLite (создается только при необходимости)
 * - PostgresDatabaseService - реализация для PostgreSQL (создается только при необходимости)
 *
 * ⚠️ Важно: Создается и инициализируется ТОЛЬКО выбранный провайдер на основе конфигурации.
 * Неиспользуемые провайдеры не создаются, что экономит ресурсы.
 *
 * @example
 * ```typescript
 * // В любом модуле
 * @Module({
 *   imports: [DatabaseModule],
 * })
 * export class FeatureModule {}
 *
 * // В сервисе
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly db: DatabaseService) {}
 *
 *   async getData() {
 *     return await this.db.myModel.findMany();
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_PROVIDER_FACTORY',
      useFactory: (configService: YamlConfigService) => {
        const config = configService.getConfig();
        const driver = config.app.database.driver as DatabaseDriver;

        switch (driver) {
          case DatabaseDriver.SQLITE:
            return new SqliteDatabaseService(configService);

          case DatabaseDriver.POSTGRESQL:
            return new PostgresDatabaseService(configService);

          default:
            throw new Error(
              `Unsupported database driver: ${driver}. Supported: ${Object.values(DatabaseDriver).join(', ')}`,
            );
        }
      },
      inject: [YamlConfigService],
    },
    {
      provide: DatabaseService,
      useFactory: (provider, configService: YamlConfigService) => {
        return new DatabaseService(configService, provider);
      },
      inject: ['DATABASE_PROVIDER_FACTORY', YamlConfigService],
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('DatabaseModule initialized - Database service ready');
    } catch (error) {
      this.logger.error(
        `DatabaseModule initialization failed: ${error.message}`,
        error.stack,
        'DatabaseModule',
      );
      throw error;
    }
  }
}
