import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
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
  imports: [ConfigModule],
  providers: [InitializationService, DirectoryInitializerService],
  exports: [InitializationService, DirectoryInitializerService],
})
export class InitializationModule implements OnModuleInit {
  private readonly logger = new Logger(InitializationModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log(
        'InitializationModule initialized - Application initialization services ready',
      );
    } catch (error) {
      this.logger.error(
        `InitializationModule initialization failed: ${error.message}`,
        error.stack,
        'InitializationModule',
      );
      throw error;
    }
  }
}
