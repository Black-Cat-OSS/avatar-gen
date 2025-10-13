import { Injectable, Logger } from '@nestjs/common';
import { IDataBaseDriver } from '../../interfaces/driver';
import { YamlConfigService } from '../../../../config/modules/yaml-driver/yaml-config.service';
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
      host: postgresConfig.host,
      port: postgresConfig.port,
      username: postgresConfig.username,
      password: postgresConfig.password,
      database: postgresConfig.database,
      ssl: postgresConfig.ssl,
      entities: [],
      synchronize: false, // Disabled for production safety
      logging: configService.getLoggingConfig().verbose,
      logger: 'simple-console',
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
