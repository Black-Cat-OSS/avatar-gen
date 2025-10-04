import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { AvatarObject } from '../../../../common/interfaces/avatar-object.interface';
import { IStorageStrategy } from '../../../../common/interfaces/storage-strategy.interface';
import { YamlConfigService } from '../../../../config/yaml-config.service';

/**
 * Сервис локального файлового хранилища
 *
 * Реализует IStorageStrategy для работы с локальной файловой системой.
 * Отвечает за сохранение, загрузку и удаление аватаров в локальной файловой системе.
 *
 * @class LocalStorageService
 * @implements {IStorageStrategy}
 */
@Injectable()
export class LocalStorageService implements IStorageStrategy {
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(private readonly configService: YamlConfigService) {}

  /**
   * Сохранение аватара в локальное хранилище
   *
   * @param {AvatarObject} avatarObject - Объект аватара для сохранения
   * @returns {Promise<string>} Путь к сохраненному файлу
   * @throws {Error} Если сохранение не удалось
   */
  async saveAvatar(avatarObject: AvatarObject): Promise<string> {
    const id = avatarObject.meta_data_name;
    const filePath = this.getFilePath(id);

    try {
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }

      const serializedData = JSON.stringify({
        ...avatarObject,
        image_4n: Array.from(avatarObject.image_4n),
        image_5n: Array.from(avatarObject.image_5n),
        image_6n: Array.from(avatarObject.image_6n),
        image_7n: Array.from(avatarObject.image_7n),
        image_8n: Array.from(avatarObject.image_8n),
        image_9n: Array.from(avatarObject.image_9n),
      });

      writeFileSync(filePath, serializedData);
      this.logger.log(`Avatar saved to local storage: ${filePath}`);

      return filePath;
    } catch (error) {
      this.logger.error(`Failed to save avatar to local storage: ${error.message}`, error);
      throw new Error(`Failed to save avatar to local storage: ${error.message}`);
    }
  }

  /**
   * Загрузка аватара из локального хранилища
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<AvatarObject>} Объект аватара
   * @throws {NotFoundException} Если аватар не найден
   * @throws {Error} Если загрузка не удалась
   */
  async loadAvatar(id: string): Promise<AvatarObject> {
    const filePath = this.getFilePath(id);

    try {
      if (!existsSync(filePath)) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      const fileContent = readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      const avatarObject: AvatarObject = {
        meta_data_name: data.meta_data_name,
        meta_data_created_at: new Date(data.meta_data_created_at),
        image_4n: Buffer.from(data.image_4n),
        image_5n: Buffer.from(data.image_5n),
        image_6n: Buffer.from(data.image_6n),
        image_7n: Buffer.from(data.image_7n),
        image_8n: Buffer.from(data.image_8n),
        image_9n: Buffer.from(data.image_9n),
      };

      this.logger.log(`Avatar loaded from local storage: ${filePath}`);
      return avatarObject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to load avatar from local storage: ${error.message}`, error);
      throw new Error(`Failed to load avatar from local storage: ${error.message}`);
    }
  }

  /**
   * Удаление аватара из локального хранилища
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<void>}
   * @throws {NotFoundException} Если аватар не найден
   * @throws {Error} Если удаление не удалось
   */
  async deleteAvatar(id: string): Promise<void> {
    const filePath = this.getFilePath(id);

    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        this.logger.log(`Avatar deleted from local storage: ${filePath}`);
      } else {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete avatar from local storage: ${error.message}`, error);
      throw new Error(`Failed to delete avatar from local storage: ${error.message}`);
    }
  }

  /**
   * Проверка существования аватара в локальном хранилище
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<boolean>} true если аватар существует
   */
  async exists(id: string): Promise<boolean> {
    const filePath = this.getFilePath(id);
    return existsSync(filePath);
  }

  /**
   * Получение пути к файлу аватара
   *
   * @private
   * @param {string} id - Идентификатор аватара
   * @returns {string} Путь к файлу
   */
  private getFilePath(id: string): string {
    const storageConfig = this.configService.getStorageConfig();
    const savePath = storageConfig.local?.save_path || './storage/avatars';
    return join(savePath, `${id}.obj`);
  }
}
