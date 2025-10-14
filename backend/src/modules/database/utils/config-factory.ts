import { Avatar } from '../../avatar/avatar.entity';
import { IDatabaseConfig } from '../interfaces/configs';
import { Configuration } from '../../../config/config.schema';

/**
 * Создает базовую конфигурацию TypeORM
 */
function createBaseConfig() {
  return {
    entities: [Avatar],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    logger: 'advanced-console' as const,
  };
}

/**
 * Создает конфигурацию TypeORM для PostgreSQL
 */
function createPostgreSQLConfig(dbConfig: Configuration['app']['database']): IDatabaseConfig {
  const baseConfig = createBaseConfig();
  const network = dbConfig.network;

  if (!network) {
    throw new Error('Network configuration is required for PostgreSQL');
  }

  const postgresConfig = {
    host: network.host,
    port: network.port,
    username: network.username,
    password: network.password,
    database: network.database,
    ssl: network.ssl,
  };

  return {
    ...baseConfig,
    type: 'postgres',
    postgres: postgresConfig,
  } as IDatabaseConfig;
}

/**
 * Создает конфигурацию TypeORM для SQLite
 */
function createSQLiteConfig(dbConfig: Configuration['app']['database']): IDatabaseConfig {
  const baseConfig = createBaseConfig();
  const sqliteParams = dbConfig.sqlite_params;

  if (!sqliteParams) {
    throw new Error('SQLite parameters are required for SQLite database');
  }

  // Извлекаем путь к файлу из URL
  const databasePath = sqliteParams.url.replace('file:', '');

  const sqliteConfig = {
    databasePath,
  };

  return {
    ...baseConfig,
    type: 'sqlite',
    sqlite: sqliteConfig,
  } as IDatabaseConfig;
}

/**
 * Фабрика для создания конфигурации TypeORM на основе настроек приложения
 */
export class TypeOrmConfigFactory {
  /**
   * Создает конфигурацию TypeORM на основе конфигурации приложения
   */
  static create(config: Configuration): IDatabaseConfig {
    const dbConfig = config.app.database;

    switch (dbConfig.driver) {
      case 'postgresql':
        return createPostgreSQLConfig(dbConfig);

      case 'sqlite':
        return createSQLiteConfig(dbConfig);

      default:
        throw new Error(`Unsupported database driver: ${dbConfig.driver}`);
    }
  }

  /**
   * Создает базовую конфигурацию TypeORM
   */
  static createBase() {
    return createBaseConfig();
  }
}
