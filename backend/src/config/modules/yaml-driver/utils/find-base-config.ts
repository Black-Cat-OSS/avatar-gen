import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Находит директорию с конфигурационными файлами
 *
 * Приоритет поиска:
 * 1. {cwd}/backend (если есть settings.yaml) - для локальной разработки
 * 2. {cwd}/settings.yaml (корень проекта) - для Docker контейнера
 * 3. {cwd}/../settings.yaml (родительская директория) - для миграций в dist
 *
 * @returns Абсолютный путь к директории с конфигами
 * @throws Error если директория с settings.yaml не найдена
 */
export function findConfigDirectory(): string {
  // Проверяем {cwd}/backend/settings.yaml (локальная разработка)
  const backendPath = join(process.cwd(), 'backend', 'settings.yaml');
  if (existsSync(backendPath)) {
    return join(process.cwd(), 'backend');
  }

  // Проверяем {cwd}/settings.yaml (корень проекта - Docker)
  const rootPath = join(process.cwd(), 'settings.yaml');
  if (existsSync(rootPath)) {
    return process.cwd();
  }

  // Проверяем {cwd}/../settings.yaml (родительская директория - миграции в dist)
  const parentPath = join(process.cwd(), '..', 'settings.yaml');
  if (existsSync(parentPath)) {
    return join(process.cwd(), '..');
  }

  // Проверяем /app/settings.yaml (Docker контейнер - миграции запускаются из /app/dist/migrations)
  const dockerAppPath = '/app/settings.yaml';
  if (existsSync(dockerAppPath)) {
    return '/app';
  }

  throw new Error(
    `Configuration directory not found. Searched:\n- ${backendPath}\n- ${rootPath}\n- ${parentPath}\n- ${dockerAppPath}`,
  );
}
