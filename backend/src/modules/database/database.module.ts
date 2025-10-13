import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../config/config.module';
import { YamlConfigService } from '../../config/modules/yaml-driver/yaml-config.service';
import { Avatar } from '../avatar/avatar.entity';
import { DatabaseService } from './database.service';
import { DatabaseDriverFactory } from './utils/driver-factory';
import { SqliteDriverService, PostgreSQLDriverService } from './modules';

/**
 * Глобальный модуль для работы с базой данных через TypeORM
 *
 * Настраивает TypeORM для работы с различными драйверами баз данных
 * (PostgreSQL, SQLite) на основе YAML конфигурации. Автоматически
 * синхронизирует схему базы данных в режиме разработки.
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
 *     return await this.db.avatar.find();
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: YamlConfigService, driverFactory: DatabaseDriverFactory) => {
        const driver = driverFactory.createDriver(configService);
        const typeormConfig = driver.buildConfigs(configService);

        typeormConfig.entities = [Avatar];

        //FIXME replace any to config type
        return typeormConfig as any;
      },
      inject: [YamlConfigService, DatabaseDriverFactory],
    }),
    TypeOrmModule.forFeature([Avatar]),
  ],
  providers: [DatabaseService, DatabaseDriverFactory, SqliteDriverService, PostgreSQLDriverService],
  exports: [DatabaseService, TypeOrmModule, DatabaseDriverFactory],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    try {
      const dbInfo = this.databaseService.getDatabaseInfo();
      this.logger.log(`🗄️  DatabaseModule initialized - ${dbInfo.driver} provider active`);
    } catch (error) {
      this.logger.error(`DatabaseModule initialization failed: ${error.message}`);
      throw error;
    }
  }
}
