import { Logger } from '@nestjs/common';

/**
 * Контекст конфигурации для передачи между загрузчиками
 */
export interface ConfigContext {
  /** Базовая директория с конфигурационными файлами */
  baseDir: string;

  /** Окружение (development, production, test) */
  nodeEnv?: string;

  /** Текущее состояние конфигурации */
  currentConfig: unknown;

  /** Logger для отладки */
  logger: Logger;
}
