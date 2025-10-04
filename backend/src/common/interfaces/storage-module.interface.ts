import { OnModuleInit } from '@nestjs/common';

/**
 * Интерфейс для модулей хранилища
 *
 * Определяет контракт, который должны реализовывать все модули хранилища.
 * Наследуется от OnModuleInit, что гарантирует наличие метода инициализации.
 *
 * Все модули хранилища должны:
 * - Реализовывать метод onModuleInit() для инициализации
 * - Экспортировать сервис, реализующий IStorageStrategy
 *
 * @interface IStorageModule
 * @extends {OnModuleInit}
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [SomeModule],
 *   providers: [SomeStorageService],
 *   exports: [SomeStorageService],
 * })
 * export class SomeStorageModule implements IStorageModule {
 *   async onModuleInit(): Promise<void> {
 *     // Инициализация модуля
 *   }
 * }
 * ```
 */
export interface IStorageModule extends OnModuleInit {
  onModuleInit(): Promise<void>;
}
