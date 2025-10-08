import { Avatar } from '../../avatar/avatar.entity';
import { INetwork } from '../../../common/interfaces';

/**
 * Интерфейс для учетных данных базы данных
 */
export interface IDataBaseCredentials {
  /** Имя пользователя БД */
  username: string;

  /** Пароль пользователя БД */
  password: string;

  /** Имя базы данных */
  database: string;
}

/**
 * Интерфейс для SSL конфигурации
 */
export interface ISslConfig {
  /** Включать ли SSL соединение */
  ssl: boolean;
}

/**
 * Конфигурация для PostgreSQL базы данных
 */
export interface IPostgresConfig extends INetwork, IDataBaseCredentials, ISslConfig {}

/**
 * Конфигурация для SQLite базы данных
 */
export interface ISqliteConfig {
  /** Путь к файлу базы данных */
  databasePath: string;
}

/**
 * Универсальная конфигурация базы данных
 */
export interface IDatabaseConfig {
  /** Тип базы данных */
  type: 'postgres' | 'sqlite';

  /** Массив сущностей для регистрации в TypeORM */
  entities: Array<typeof Avatar>;

  /** Включать ли автоматическую синхронизацию схемы БД */
  synchronize: boolean;

  /** Включать ли логирование SQL запросов */
  logging: boolean;

  /** Тип логгера для TypeORM */
  logger: 'advanced-console' | 'simple-console' | 'file' | 'debug';

  /** Конфигурация для PostgreSQL (если type === 'postgres') */
  postgres?: IPostgresConfig;

  /** Конфигурация для SQLite (если type === 'sqlite') */
  sqlite?: ISqliteConfig;

  /** PostgreSQL параметры подключения (на верхнем уровне для TypeORM) */
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;

  /** SQLite параметр (на верхнем уровне для TypeORM) */
  databasePath?: string;
}
