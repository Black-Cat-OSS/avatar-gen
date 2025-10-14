import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Находит директорию с конфигурационными файлами
 *
 * Приоритет поиска:
 * 1. {cwd}/backend (если есть settings.yaml)
 * 2. {cwd} (корень проекта)
 *
 * @returns Абсолютный путь к директории с конфигами
 * @throws Error если директория с settings.yaml не найдена
 */
export function findConfigDirectory(): string {
  // Проверяем {cwd}/backend/settings.yaml
  const backendPath = join(process.cwd(), 'backend', 'settings.yaml');
  if (existsSync(backendPath)) {
    return join(process.cwd(), 'backend');
  }

  // Проверяем {cwd}/settings.yaml (корень проекта)
  const rootPath = join(process.cwd(), 'settings.yaml');
  if (existsSync(rootPath)) {
    return process.cwd();
  }

  throw new Error(`Configuration directory not found. Searched:\n- ${backendPath}\n- ${rootPath}`);
}
