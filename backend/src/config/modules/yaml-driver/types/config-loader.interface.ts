import { ConfigContext } from './config-context.interface';

/**
 * Интерфейс для Chain of Responsibility паттерна
 * Каждый загрузчик загружает один файл и передает контекст следующему
 */
export interface IConfigLoader {
  /**
   * Загружает конфигурацию и обновляет контекст
   * @param context Контекст с текущим состоянием конфигурации
   * @returns Обновленный контекст
   */
  load(context: ConfigContext): ConfigContext;

  /**
   * Устанавливает следующий загрузчик в цепочке
   * @param loader Следующий загрузчик
   * @returns Следующий загрузчик (для цепочки вызовов)
   */
  setNext(loader: IConfigLoader): IConfigLoader;
}
