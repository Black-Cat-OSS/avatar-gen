/**
 * Константы для модуля Database
 *
 * Содержит токены для dependency injection
 */

/**
 * Токен для инжекции сервиса базы данных
 *
 * Используется для получения активной реализации IDatabaseConnection
 *
 * @example
 * ```typescript
 * constructor(
 *   @Inject(DATABASE_CONNECTION) private readonly db: IDatabaseConnection
 * ) {}
 * ```
 */
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

/**
 * Типы поддерживаемых драйверов баз данных
 */
export enum DatabaseDriver {
  SQLITE = 'sqlite',
  POSTGRESQL = 'postgresql',
}
