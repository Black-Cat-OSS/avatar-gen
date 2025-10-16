import { AvatarObject } from './avatar-object.interface';

/**
 * Интерфейс стратегии генерации аватаров
 *
 * Определяет контракт для реализации различных типов генераторов (pixelize, wave, etc.).
 * Используется паттерн Strategy для поддержки различных способов генерации.
 *
 * @interface IGeneratorStrategy
 */
export interface IGeneratorStrategy {
  /**
   * Генерация аватара
   *
   * @param {string} primaryColor - Основной цвет
   * @param {string} foreignColor - Дополнительный цвет
   * @param {string} colorScheme - Цветовая схема
   * @param {string} seed - Сид для генерации
   * @param {number} angle - Угол поворота (для градиентных генераторов)
   * @returns {Promise<AvatarObject>} Объект аватара
   * @throws {Error} Если генерация не удалась
   */
  generateAvatar(
    primaryColor?: string,
    foreignColor?: string,
    colorScheme?: string,
    seed?: string,
    angle?: number,
  ): Promise<AvatarObject>;

  /**
   * Получение доступных цветовых схем
   *
   * @returns {Array} Массив цветовых схем
   */
  getColorSchemes(): Array<{ name: string; primaryColor: string; foreignColor: string }>;
}
