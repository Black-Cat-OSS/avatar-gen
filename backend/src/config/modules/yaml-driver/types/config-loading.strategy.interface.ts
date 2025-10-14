import { BuildPlan } from './build-plan.interface';

/**
 * Интерфейс стратегии загрузки конфигурации
 * Паттерн Strategy для гибкого выбора алгоритма загрузки
 *
 * Стратегия НЕ загружает конфигурацию сама!
 * Стратегия создает ПЛАН построения
 */
export interface IConfigLoadingStrategy {
  /**
   * Создает план построения конфигурации
   * @param basePath Базовая директория
   * @param nodeEnv Окружение (development, production, test)
   * @returns План с файлами для загрузки
   */
  createBuildPlan(basePath: string, nodeEnv?: string): BuildPlan;

  /**
   * Возвращает имя стратегии для логирования
   */
  getName(): string;
}
