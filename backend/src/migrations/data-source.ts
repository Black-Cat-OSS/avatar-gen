import { DataSource, DataSourceOptions } from 'typeorm';
import { Avatar } from '../modules/avatar/avatar.entity';
import { AddGeneratorTypeToAvatar1739467273000 } from './1739467273000-AddGeneratorTypeToAvatar';
import { YamlConfigService } from '../config/modules/yaml-driver/yaml-config.service';
import { DatabaseDriverFactory } from '../modules/database/utils/driver-factory';
import { SqliteDriverService } from '../modules/database/modules/sqlite-driver';
import { PostgreSQLDriverService } from '../modules/database/modules/postgresql-driver';
import { ConfigurationBuilder } from '../config/modules/yaml-driver/builders/configuration.builder';
import { YamlFileStrategy } from '../config/modules/yaml-driver/strategies/yaml-file.strategy';
import { FileReaderService } from '../config/modules/yaml-driver/services/file-reader.service';
import { ConfigMergerService } from '../config/modules/yaml-driver/services/config-merger.service';

/**
 * Конфигурация источника данных для TypeORM миграций
 * Использует ту же конфигурацию драйвера, что и основное приложение
 */
async function createDataSourceOptions(): Promise<DataSourceOptions> {
  const fileReaderService = new FileReaderService();
  const configMergerService = new ConfigMergerService();
  const strategy = new YamlFileStrategy();
  const builder = new ConfigurationBuilder(fileReaderService, configMergerService);
  const configService = new YamlConfigService(builder, strategy);

  const sqliteDriver = new SqliteDriverService();
  const postgresqlDriver = new PostgreSQLDriverService();
  const driverFactory = new DatabaseDriverFactory(sqliteDriver, postgresqlDriver);

  const driver = driverFactory.createDriver(configService);
  const typeormConfig = driver.buildConfigs(configService);

  let dataSourceOptions: DataSourceOptions;

  if (typeormConfig.type === 'sqlite') {
    dataSourceOptions = {
      type: 'sqlite',
      database: typeormConfig.sqlite?.databasePath || './storage/database/avatars.db',
      entities: [Avatar],
      //TODO: create migration reader for reading all migrations files and import dynamically
      migrations: [AddGeneratorTypeToAvatar1739467273000],
      migrationsTableName: 'migrations',
      logging: true,
      synchronize: false,
    };
  } else if (typeormConfig.type === 'postgres') {
    dataSourceOptions = {
      type: 'postgres',
      host: typeormConfig.host,
      port: typeormConfig.port,
      username: typeormConfig.username,
      password: typeormConfig.password,
      database: typeormConfig.database,
      ssl: typeormConfig.ssl,
      entities: [Avatar],
      migrations: [AddGeneratorTypeToAvatar1739467273000],
      migrationsTableName: 'migrations',
      logging: true,
      synchronize: false,
    };
  } else {
    throw new Error(`Unsupported database type: ${typeormConfig.type}`);
  }

  return dataSourceOptions;
}

let dataSource: DataSource;

async function initializeDataSource(): Promise<DataSource> {
  if (!dataSource) {
    const options = await createDataSourceOptions();
    dataSource = new DataSource(options);
  }
  return dataSource;
}

export { initializeDataSource };
export default initializeDataSource;