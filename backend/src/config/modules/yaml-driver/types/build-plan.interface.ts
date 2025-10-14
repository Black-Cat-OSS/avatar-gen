/**
 * План построения конфигурации
 * Создается Strategy и передается Builder'у
 */
export interface BuildPlan {
  /** Базовая директория */
  baseDir: string;

  /** Окружение */
  nodeEnv?: string;

  /** Список файлов для загрузки (в порядке приоритета) */
  filesToLoad: ConfigFile[];
}

/**
 * Описание конфигурационного файла для загрузки
 */
export interface ConfigFile {
  /** Имя файла (например, 'settings.yaml') */
  fileName: string;

  /** Обязателен ли файл (если нет - пропускаем) */
  required: boolean;
}
