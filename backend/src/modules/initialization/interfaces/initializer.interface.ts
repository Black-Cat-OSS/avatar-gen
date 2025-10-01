import { OnModuleInit } from '@nestjs/common';

/**
 * Интерфейс для компонентов инициализации приложения
 *
 * Определяет контракт для всех модулей инициализации, которые должны выполняться
 * при запуске приложения. Позволяет легко добавлять новые этапы инициализации
 * без изменения существующего кода.
 *
 * @interface IInitializer
 * @extends {OnModuleInit}
 */
export interface IInitializer extends OnModuleInit {
  /**
   * Идентификатор инициализатора для логирования и отладки
   *
   * @returns {string} Уникальное имя инициализатора
   */
  getInitializerId(): string;

  /**
   * Приоритет инициализации (меньше = раньше)
   *
   * Определяет порядок выполнения инициализаторов.
   * Меньшие значения выполняются раньше.
   *
   * @returns {number} Приоритет (по умолчанию 100)
   */
  getPriority(): number;

  /**
   * Проверка готовности к инициализации
   *
   * Опциональный метод для проверки предварительных условий.
   * Если возвращает false, инициализация пропускается.
   *
   * @returns {Promise<boolean>} true если готов к инициализации
   */
  isReady?(): Promise<boolean>;

  /**
   * Выполнение инициализации
   *
   * Основной метод инициализации. Вызывается автоматически NestJS
   * или вручную через InitializationService.
   *
   * @returns {Promise<void>}
   * @throws {Error} Если инициализация не удалась
   */
  initialize(): Promise<void>;

  /**
   * Откат инициализации (при необходимости)
   *
   * Опциональный метод для отката изменений в случае ошибки.
   * Полезен для транзакционной инициализации.
   *
   * @returns {Promise<void>}
   */
  rollback?(): Promise<void>;
}

/**
 * Конфигурация инициализатора
 *
 * @interface InitializerConfig
 */
export interface InitializerConfig {
  /**
   * Включить инициализатор
   */
  enabled: boolean;

  /**
   * Приоритет выполнения
   */
  priority: number;

  /**
   * Таймаут инициализации в миллисекундах
   */
  timeout: number;

  /**
   * Повторные попытки при ошибке
   */
  retryCount: number;

  /**
   * Дополнительные параметры
   */
  options?: Record<string, unknown>;
}

/**
 * Статус инициализации
 *
 * @interface InitializationStatus
 */
export interface InitializationStatus {
  /**
   * Идентификатор инициализатора
   */
  id: string;

  /**
   * Приоритет
   */
  priority: number;

  /**
   * Статус выполнения
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

  /**
   * Время начала инициализации
   */
  startTime?: Date;

  /**
   * Время завершения инициализации
   */
  endTime?: Date;

  /**
   * Длительность инициализации в миллисекундах
   */
  duration?: number;

  /**
   * Сообщение об ошибке (если есть)
   */
  error?: string;

  /**
   * Дополнительная информация
   */
  metadata?: Record<string, unknown>;
}
