import { Module, Global } from '@nestjs/common';
import { DirectoryInitializerService } from './services/directory-initializer.service';
import { InitializationService } from './services/initialization.service';

/**
 * Глобальный модуль инициализации приложения
 *
 * Обеспечивает правильную инициализацию всех компонентов приложения
 * при запуске. Управляет жизненным циклом и порядком выполнения
 * различных этапов инициализации.
 *
 * Архитектура модуля:
 * - InitializationService - главный координатор инициализации
 * - DirectoryInitializerService - инициализация директорий
 * - Будущие инициализаторы - база данных, конфигурация, миграции и т.д.
 *
 * @example
 * ```typescript
 * // В AppModule
 * @Module({
 *   imports: [
 *     InitializationModule,
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({
  providers: [
    // Основной сервис инициализации
    InitializationService,

    // Сервисы инициализации (подмодули)
    DirectoryInitializerService,

    // В будущем можно добавить:
    // DatabaseInitializerService,
    // ConfigurationInitializerService,
    // MigrationInitializerService,
    // CacheInitializerService,
    // QueueInitializerService,
  ],
  exports: [
    // Экспортируем сервисы для внешнего использования
    InitializationService,
    DirectoryInitializerService,
  ],
})
export class InitializationModule {}
