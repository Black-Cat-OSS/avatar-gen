import { Injectable } from '@nestjs/common';

/**
 * Сервис для глубокого слияния объектов конфигурации
 * Использует рекурсивный алгоритм deep merge
 */
@Injectable()
export class ConfigMergerService {
  /**
   * Глубокое слияние двух объектов
   * Вложенные объекты сливаются рекурсивно
   * Массивы НЕ сливаются, а заменяются полностью
   *
   * @param base Базовый объект
   * @param override Объект с переопределениями
   * @returns Новый объект с объединенными данными
   */
  deepMerge<T>(base: T, override: Partial<T>): T {
    const result = { ...base };

    for (const key in override) {
      if (Object.prototype.hasOwnProperty.call(override, key)) {
        const baseValue = result[key];
        const overrideValue = override[key];

        if (
          baseValue &&
          overrideValue &&
          typeof baseValue === 'object' &&
          typeof overrideValue === 'object' &&
          !Array.isArray(baseValue) &&
          !Array.isArray(overrideValue)
        ) {
          // Рекурсивно сливаем вложенные объекты
          result[key] = this.deepMerge(baseValue, overrideValue);
        } else {
          // Простые значения и массивы заменяются
          result[key] = overrideValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }
}
