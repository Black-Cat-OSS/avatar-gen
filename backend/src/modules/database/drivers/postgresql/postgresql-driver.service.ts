import { Injectable, Logger } from '@nestjs/common';
import { IDataBaseDriver } from '../../interfaces/driver';
import { YamlConfigService } from '../../../../config/yaml-config.service';
import { IDatabaseConfig } from '../../interfaces/configs';

/**
 * Драйвер для работы с PostgreSQL базой данных
 * Реализует интерфейс IDataBaseDriver для создания конфигурации TypeORM
 */
@Injectable()
export class PostgreSQLDriverService implements IDataBaseDriver {
  private readonly logger = new Logger(PostgreSQLDriverService.name);

  /**
   * Строит конфигурацию TypeORM для PostgreSQL
   * @param configService - сервис конфигурации YAML
   * @returns конфигурация TypeORM для PostgreSQL
   */
  buildConfigs(configService: YamlConfigService): IDatabaseConfig {
    this.logger.debug('Building PostgreSQL TypeORM configuration');

    const config = configService.getDatabaseConfig();
    const networkParams = config.network;

    if (!networkParams) {
      throw new Error('PostgreSQL network parameters are required in configuration');
    }

    const postgresConfig = {
      host: networkParams.host,
      port: networkParams.port,
      username: networkParams.username,
      password: networkParams.password,
      database: networkParams.database,
      ssl: networkParams.ssl,
    };

    const typeOrmConfig: IDatabaseConfig = {
      type: 'postgres',
      entities: [], // Будет заполнено в DatabaseModule
      synchronize: false, // PostgreSQL не поддерживает автоматическую синхронизацию в production
      logging: configService.getLoggingConfig().verbose,
      logger: 'simple-console',
      postgres: postgresConfig,
    };

    this.logger.debug(
      `PostgreSQL configuration built: host=${postgresConfig.host}, port=${postgresConfig.port}, database=${postgresConfig.database}`,
    );
    return typeOrmConfig;
  }

  /**
   * Возвращает имя драйвера
   * @returns строка с именем драйвера
   */
  getDriverName(): string {
    return 'postgresql';
  }
}
