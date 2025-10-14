import { Injectable } from '@nestjs/common';
import { YamlSettingsFinder } from 'find-settings.lib/dist/yaml';
import { IConfigLoadingStrategy } from '../types/config-loading.strategy.interface';
import { BuildPlan, ConfigFile } from '../types/build-plan.interface';

/**
 * Стратегия для создания плана загрузки YAML конфигураций
 * Использует find-settings.lib для поиска файлов
 *
 * Порядок загрузки (по приоритету):
 * 1. settings.yaml (обязательный)
 * 2. settings.local.yaml (если существует)
 * 3. settings.{NODE_ENV}.yaml (если существует)
 * 4. settings.{NODE_ENV}.local.yaml (если существует)
 */
@Injectable()
export class YamlFileStrategy implements IConfigLoadingStrategy {
  getName(): string {
    return 'YamlFileStrategy';
  }

  /**
   * Создает план построения конфигурации из YAML файлов
   * Использует find-settings.lib для поиска существующих файлов
   *
   * @param basePath Директория с конфигурационными файлами
   * @param nodeEnv Окружение (используется для возврата в плане)
   * @returns План с файлами для загрузки (только существующие)
   */
  createBuildPlan(basePath: string, nodeEnv?: string): BuildPlan {
    const finder = new YamlSettingsFinder(basePath, 'settings');
    const foundFiles = finder.find();

    const hasBaseFile = foundFiles.some(f => f === 'settings.yaml' || f === 'settings.yml');

    if (!hasBaseFile) {
      throw new Error(`Required configuration file not found: settings.yaml in ${basePath}`);
    }

    const priorityOrder = [
      'settings.yaml',
      'settings.yml',
      'settings.local.yaml',
      'settings.local.yml',
      nodeEnv ? `settings.${nodeEnv}.yaml` : null,
      nodeEnv ? `settings.${nodeEnv}.yml` : null,
      nodeEnv ? `settings.${nodeEnv}.local.yaml` : null,
      nodeEnv ? `settings.${nodeEnv}.local.yml` : null,
    ].filter(Boolean) as string[];

    const files: ConfigFile[] = [];

    for (const fileName of priorityOrder) {
      if (foundFiles.includes(fileName)) {
        files.push({
          fileName,
          required: fileName === 'settings.yaml' || fileName === 'settings.yml',
        });
      }
    }

    return {
      baseDir: basePath,
      nodeEnv,
      filesToLoad: files,
    };
  }
}
