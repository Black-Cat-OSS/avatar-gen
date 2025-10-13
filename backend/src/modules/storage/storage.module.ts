import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { StorageService } from './storage.service';
import { LocalStorageModule } from './modules/local-driver';
import { S3StorageModule } from './modules/s3-driver';

/**
 * Главный модуль хранилища
 *
 * Динамически подключает нужный модуль хранилища (Local или S3) на основе конфигурации.
 * Использует паттерн Strategy для поддержки различных типов хранилищ.
 *
 * Следует best practices NestJS для динамических модулей:
 * @see https://docs.nestjs.com/fundamentals/dynamic-modules
 *
 * @module StorageModule
 */
@Module({})
export class StorageModule {
  /**
   * Регистрация модуля с автоматическим определением типа хранилища
   *
   * **Упрощенная архитектура (без токенов и фабрик):**
   * 1. Импортирует оба модуля хранилища (Local и S3)
   * 2. Каждый модуль проверяет конфигурацию в `onModuleInit()` и пропускает инициализацию если не нужен
   * 3. `StorageService` напрямую инжектирует оба сервиса в конструктор
   * 4. В конструкторе `StorageService` выбирается нужная стратегия на основе конфигурации
   *
   * **Простота и надежность:**
   * - Нет промежуточных токенов (`STORAGE_STRATEGY`)
   * - Нет фабрик (`useFactory`)
   * - Стандартный NestJS DI через импорты модулей
   * - Выбор стратегии в конструкторе `StorageService`
   *
   * **Singleton lifecycle:**
   * - `StorageService` создается один раз при старте приложения
   * - Живет на протяжении всей жизни приложения
   * - Повторное создание не происходит
   *
   * **Условная инициализация:**
   * - `LocalStorageModule.onModuleInit()` → выполняется только если `storage.type === 'local'`
   * - `S3StorageModule.onModuleInit()` → выполняется только если `storage.type === 's3'`
   *
   * @static
   * @returns {DynamicModule} Динамический модуль
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [StorageModule.register()],
   * })
   * export class AvatarModule {}
   * ```
   */
  static register(): DynamicModule {
    return {
      module: StorageModule,
      imports: [ConfigModule, LocalStorageModule, S3StorageModule],
      providers: [StorageService],
      exports: [StorageService],
      global: false,
    };
  }

  /**
   * Глобальная регистрация модуля хранилища
   *
   * Делает StorageService доступным глобально во всем приложении без повторного импорта.
   * Рекомендуется использовать в AppModule для централизованного управления хранилищем.
   *
   * @static
   * @returns {DynamicModule} Глобальный динамический модуль
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [StorageModule.forRoot()],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(): DynamicModule {
    return {
      ...this.register(),
      global: true,
    };
  }
}
