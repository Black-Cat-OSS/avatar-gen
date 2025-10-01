import { PrismaClient } from '@prisma/client';

/**
 * Интерфейс для взаимодействия с базой данных
 *
 * Определяет контракт для реализации подключения к различным типам баз данных.
 * Соблюдается принцип подстановки Лисков (LSP) - все реализации должны быть взаимозаменяемы.
 *
 * ⚠️ Важно: Провайдеры НЕ должны implements OnModuleInit/OnModuleDestroy.
 * Жизненный цикл (init/destroy) контролируется DatabaseService (Facade),
 * который вызывает эти методы только для выбранного провайдера на основе конфигурации.
 *
 * @interface IDatabaseConnection
 */
export interface IDatabaseConnection {
  /**
   * Доступ к PrismaClient экземпляру
   */
  readonly prisma: PrismaClient;

  /**
   * Инициализация модуля и подключение к базе данных
   *
   * @returns {Promise<void>}
   * @throws {Error} Если подключение не удалось установить после всех попыток
   */
  onModuleInit(): Promise<void>;

  /**
   * Отключение от базы данных при уничтожении модуля
   *
   * @returns {Promise<void>}
   */
  onModuleDestroy(): Promise<void>;

  /**
   * Проверка состояния подключения к базе данных
   *
   * Выполняет простой запрос для проверки доступности БД.
   * Используется для health check endpoints.
   *
   * @returns {Promise<boolean>} true если подключение активно и БД отвечает, false в противном случае
   */
  healthCheck(): Promise<boolean>;

  /**
   * Получение информации о подключенной базе данных
   *
   * @returns {DatabaseInfo} Объект с информацией о типе драйвера, статусе подключения и конфигурации
   */
  getDatabaseInfo(): DatabaseInfo;

  /**
   * Принудительное переподключение к базе данных
   *
   * Используется для восстановления соединения после потери связи с БД.
   *
   * @returns {Promise<void>}
   * @throws {Error} Если переподключение не удалось после всех попыток
   */
  reconnect(): Promise<void>;
}

/**
 * Информация о подключении к базе данных
 *
 * @interface DatabaseInfo
 */
export interface DatabaseInfo {
  /**
   * Тип драйвера базы данных (sqlite, postgresql и т.д.)
   */
  driver: string;

  /**
   * Статус подключения к базе данных
   */
  connected: boolean;

  /**
   * Конфигурация базы данных
   */
  config: Record<string, unknown>;
}
