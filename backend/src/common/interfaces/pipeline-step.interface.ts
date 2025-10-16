/**
 * Интерфейс для шагов обработки в pipeline
 *
 * Определяет контракт для реализации различных этапов обработки данных.
 * Используется паттерн Pipeline для последовательной обработки данных.
 *
 * @template T - Тип данных для обработки
 * @interface IPipelineStep
 */
export interface IPipelineStep<T> {
  /**
   * Обработка входных данных
   *
   * @param {T} input - Входные данные для обработки
   * @returns {Promise<T>} Обработанные данные
   * @throws {Error} Если обработка не удалась
   */
  process(input: T): Promise<T>;
}
