import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { YamlDotEnv } from 'yaml-dotenv';

/**
 * Сервис для чтения и парсинга YAML файлов
 * Использует yaml-dotenv для подстановки env переменных
 */
@Injectable()
export class FileReaderService {
  private readonly logger = new Logger(FileReaderService.name);

  /**
   * Читает YAML файл и подставляет env переменные
   * @param filePath Путь к файлу
   * @returns Распарсенный объект конфигурации
   * @throws Error если файл не существует или невалиден
   */
  readYamlFile(filePath: string): unknown {
    this.logger.debug(`Reading YAML file: ${filePath}`);

    const content = readFileSync(filePath, 'utf8');
    const processed = YamlDotEnv.convertTo(content);
    const parsed = yaml.load(processed);

    this.logger.debug(`Successfully parsed YAML: ${filePath}`);
    return parsed;
  }

  /**
   * Проверяет существование файла
   * @param filePath Путь к файлу
   * @returns true если файл существует
   */
  fileExists(filePath: string): boolean {
    return existsSync(filePath);
  }
}
