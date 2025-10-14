import { YamlConfigService } from '../../../config/modules/yaml-driver/yaml-config.service';
import { IDatabaseConfig } from './configs';

/**
 * Интерфейс для драйверов баз данных
 * Каждый драйвер должен реализовать этот интерфейс для создания конфигурации TypeORM
 */
export interface IDataBaseDriver {
  /**
   * Строит конфигурацию TypeORM на основе настроек из YAML конфигурации
   * @param configService - сервис конфигурации YAML
   * @returns конфигурация TypeORM для конкретного драйвера
   */
  buildConfigs(configService: YamlConfigService): IDatabaseConfig;

  /**
   * Возвращает имя драйвера
   * @returns строка с именем драйвера (sqlite, postgresql)
   */
  getDriverName(): string;
}
