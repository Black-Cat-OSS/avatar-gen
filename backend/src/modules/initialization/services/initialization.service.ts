import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IInitializer, InitializationStatus } from '../interfaces/initializer.interface';

/**
 * Основной сервис инициализации приложения
 *
 * Управляет всеми инициализаторами приложения, обеспечивая правильный порядок
 * выполнения и обработку ошибок. Позволяет легко добавлять новые этапы
 * инициализации без изменения существующего кода.
 *
 * @class InitializationService
 * @implements {OnModuleInit}
 */
@Injectable()
export class InitializationService implements OnModuleInit {
  private readonly logger = new Logger(InitializationService.name);
  private readonly initializers = new Map<string, IInitializer>();
  private readonly status = new Map<string, InitializationStatus>();

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Starting application initialization...');

    try {
      await this.discoverInitializers();
      await this.executeInitialization();

      this.logger.log('Application initialization completed successfully');
    } catch (error) {
      this.logger.error('Application initialization failed', error);
      throw error;
    }
  }

  /**
   * Регистрация инициализатора
   *
   * @param {IInitializer} initializer - Инициализатор для регистрации
   */
  registerInitializer(initializer: IInitializer): void {
    const id = initializer.getInitializerId();

    if (this.initializers.has(id)) {
      this.logger.warn(`Initializer ${id} already registered, skipping`);
      return;
    }

    this.initializers.set(id, initializer);
    this.status.set(id, {
      id,
      priority: initializer.getPriority(),
      status: 'pending',
    });

    this.logger.debug(`Registered initializer: ${id} (priority: ${initializer.getPriority()})`);
  }

  /**
   * Получение статуса инициализации
   *
   * @param {string} initializerId - Идентификатор инициализатора
   * @returns {InitializationStatus | undefined} Статус инициализации
   */
  getInitializerStatus(initializerId: string): InitializationStatus | undefined {
    return this.status.get(initializerId);
  }

  /**
   * Получение статуса всех инициализаторов
   *
   * @returns {InitializationStatus[]} Массив статусов всех инициализаторов
   */
  getAllInitializerStatus(): InitializationStatus[] {
    return Array.from(this.status.values());
  }

  /**
   * Поиск всех доступных инициализаторов в приложении
   *
   * @private
   * @returns {Promise<void>}
   */
  private async discoverInitializers(): Promise<void> {
    try {
      const directoryInitializer = this.moduleRef.get('DirectoryInitializerService', {
        strict: false,
      });
      if (directoryInitializer) {
        this.registerInitializer(directoryInitializer);
      }
    } catch {
      this.logger.warn('DirectoryInitializerService not found, skipping');
    }

    this.logger.log(`Discovered ${this.initializers.size} initializers`);
  }

  /**
   * Выполнение инициализации в порядке приоритета
   *
   * @private
   * @returns {Promise<void>}
   */
  private async executeInitialization(): Promise<void> {
    const sortedInitializers = Array.from(this.initializers.values()).sort(
      (a, b) => a.getPriority() - b.getPriority(),
    );

    this.logger.log(`Executing ${sortedInitializers.length} initializers...`);

    for (const initializer of sortedInitializers) {
      await this.executeInitializer(initializer);
    }
  }

  /**
   * Выполнение одного инициализатора
   *
   * @private
   * @param {IInitializer} initializer - Инициализатор для выполнения
   * @returns {Promise<void>}
   */
  private async executeInitializer(initializer: IInitializer): Promise<void> {
    const id = initializer.getInitializerId();
    const status = this.status.get(id)!;

    this.logger.log(`Initializing: ${id} (priority: ${status.priority})`);

    status.status = 'running';
    status.startTime = new Date();

    try {
      if (initializer.isReady && !(await initializer.isReady())) {
        this.logger.warn(`Initializer ${id} not ready, skipping`);
        status.status = 'skipped';
        return;
      }

      await initializer.initialize();

      status.status = 'completed';
      status.endTime = new Date();
      status.duration = status.endTime.getTime() - status.startTime.getTime();

      this.logger.log(`✓ ${id} completed in ${status.duration}ms`);
    } catch (error) {
      status.status = 'failed';
      status.endTime = new Date();
      status.duration = status.endTime.getTime() - status.startTime.getTime();
      status.error = error instanceof Error ? error.message : String(error);

      this.logger.error(`✗ ${id} failed in ${status.duration}ms: ${status.error}`, error);

      if (initializer.rollback) {
        try {
          await initializer.rollback();
          this.logger.log(`✓ ${id} rollback completed`);
        } catch (rollbackError) {
          this.logger.error(`✗ ${id} rollback failed: ${rollbackError.message}`, rollbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Принудительный запуск инициализации (для тестирования или повторного запуска)
   *
   * @returns {Promise<void>}
   */
  async reinitialize(): Promise<void> {
    this.logger.warn('Forcing re-initialization...');

    for (const status of this.status.values()) {
      status.status = 'pending';
      status.startTime = undefined;
      status.endTime = undefined;
      status.duration = undefined;
      status.error = undefined;
    }

    await this.executeInitialization();
  }
}
