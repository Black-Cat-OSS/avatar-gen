import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../config/config.module';
import { YamlConfigService } from '../../config/yaml-config.service';
import { Avatar } from './entities/avatar.entity';
import { DatabaseService } from './database.service';

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
      useFactory: (configService: YamlConfigService) => {
        const config = configService.getConfig();
        const dbConfig = config.app.database;
        
        // Базовые настройки TypeORM
        const typeormConfig: any = {
          entities: [Avatar],
          synchronize: process.env.NODE_ENV !== 'production', // Автосинхронизация только в dev
          logging: process.env.NODE_ENV === 'development',
          logger: 'advanced-console',
        };

        // Настройки в зависимости от драйвера
        if (dbConfig.driver === 'postgresql') {
          const network = dbConfig.network;
          typeormConfig.type = 'postgres';
          typeormConfig.host = network.host;
          typeormConfig.port = network.port;
          typeormConfig.username = network.username;
          typeormConfig.password = network.password;
          typeormConfig.database = network.database;
          typeormConfig.ssl = network.ssl ? { rejectUnauthorized: false } : false;
        } else if (dbConfig.driver === 'sqlite') {
          typeormConfig.type = 'sqlite';
          typeormConfig.database = dbConfig.sqlite_params.url;
        } else {
          throw new Error(`Unsupported database driver: ${dbConfig.driver}`);
        }

        return typeormConfig;
      },
      inject: [YamlConfigService],
    }),
    TypeOrmModule.forFeature([Avatar]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
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