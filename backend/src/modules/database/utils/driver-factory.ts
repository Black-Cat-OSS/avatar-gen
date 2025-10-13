import { Injectable, Logger } from '@nestjs/common';
import { IDataBaseDriver } from '../interfaces/driver';
import { SqliteDriverService } from '../modules/sqlite-driver';
import { PostgreSQLDriverService } from '../modules/postgresql-driver';
import { YamlConfigService } from '../../../config/modules/yaml-driver/yaml-config.service';

/**
 * Фабрика для создания драйверов баз данных
 * Выбирает нужный драйвер на основе конфигурации
 */
@Injectable()
export class DatabaseDriverFactory {
  private readonly logger = new Logger(DatabaseDriverFactory.name);

  constructor(
    private readonly sqliteDriver: SqliteDriverService,
    private readonly postgresqlDriver: PostgreSQLDriverService,
  ) {}

  /**
   * Создает драйвер базы данных на основе конфигурации
   * @param configService - сервис конфигурации YAML
   * @returns экземпляр драйвера базы данных
   */
  createDriver(configService: YamlConfigService): IDataBaseDriver {
    const databaseConfig = configService.getDatabaseConfig();
    const driver = databaseConfig.driver;

    this.logger.debug(`Creating database driver: ${driver}`);

    switch (driver) {
      case 'sqlite':
        this.logger.log('Using SQLite database driver');
        return this.sqliteDriver;

      case 'postgresql':
        this.logger.log('Using PostgreSQL database driver');
        return this.postgresqlDriver;

      default:
        throw new Error(`Unsupported database driver: ${driver}`);
    }
  }

  /**
   * Получает все доступные драйверы
   * @returns массив всех доступных драйверов
   */
  getAllDrivers(): IDataBaseDriver[] {
    return [this.sqliteDriver, this.postgresqlDriver];
  }

  /**
   * Получает драйвер по имени
   * @param driverName - имя драйвера
   * @returns экземпляр драйвера или undefined если не найден
   */
  getDriverByName(driverName: string): IDataBaseDriver | undefined {
    return this.getAllDrivers().find(driver => driver.getDriverName() === driverName);
  }
}
