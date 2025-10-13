import { Injectable, Logger } from '@nestjs/common';
import { IDataBaseDriver } from '../../interfaces/driver';
import { YamlConfigService } from '../../../../config/modules/yaml-driver/yaml-config.service';
import { IDatabaseConfig } from '../../interfaces/configs';

/**
 * Драйвер для работы с SQLite базой данных
 * Реализует интерфейс IDataBaseDriver для создания конфигурации TypeORM
 */
@Injectable()
export class SqliteDriverService implements IDataBaseDriver {
  private readonly logger = new Logger(SqliteDriverService.name);

  /**
   * Строит конфигурацию TypeORM для SQLite
   * @param configService - сервис конфигурации YAML
   * @returns конфигурация TypeORM для SQLite
   */
  buildConfigs(configService: YamlConfigService): IDatabaseConfig {
    this.logger.debug('Building SQLite TypeORM configuration');

    const config = configService.getDatabaseConfig();
    const sqliteParams = config.sqlite_params;

    if (!sqliteParams?.url) {
      throw new Error('SQLite database URL is required in configuration');
    }

    const sqliteConfig = {
      databasePath: sqliteParams.url.replace('file:', ''),
    };

    const typeOrmConfig: IDatabaseConfig = {
      type: 'sqlite',
      entities: [],
      synchronize: true,
      logging: configService.getLoggingConfig().verbose,
      logger: 'simple-console',
      sqlite: sqliteConfig,
    };

    this.logger.debug(`SQLite configuration built: databasePath=${sqliteConfig.databasePath}`);
    return typeOrmConfig;
  }

  /**
   * Возвращает имя драйвера
   * @returns строка с именем драйвера
   */
  getDriverName(): string {
    return 'sqlite';
  }
}
