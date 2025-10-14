import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { AvatarObject } from '../../../../common/interfaces/avatar-object.interface';
import { IStorageStrategy } from '../../../../common/interfaces/storage-strategy.interface';
import { S3Service } from '../../../s3';

/**
 * Сервис S3 хранилища
 *
 * Реализует IStorageStrategy для работы с S3-совместимым хранилищем.
 * Отвечает за сохранение, загрузку и удаление аватаров в S3.
 *
 * **Важно**: S3Service может быть null, если storage.type !== 's3'.
 * В этом случае методы выбрасывают ошибку о недоступности S3.
 *
 * @class S3StorageService
 * @implements {IStorageStrategy}
 */
@Injectable()
export class S3StorageService implements IStorageStrategy {
  private readonly logger = new Logger(S3StorageService.name);

  constructor(@Optional() private readonly s3Service: S3Service) {}

  /**
   * Сохранение аватара в S3
   *
   * @param {AvatarObject} avatarObject - Объект аватара для сохранения
   * @returns {Promise<string>} URL сохраненного объекта
   * @throws {Error} Если сохранение не удалось
   */
  async saveAvatar(avatarObject: AvatarObject): Promise<string> {
    if (!this.s3Service) {
      throw new Error('S3Service is not available. Check storage configuration.');
    }

    const id = avatarObject.meta_data_name;
    const key = `avatars/${id}.obj`;

    try {
      const serializedData = JSON.stringify({
        ...avatarObject,
        image_4n: Array.from(avatarObject.image_4n),
        image_5n: Array.from(avatarObject.image_5n),
        image_6n: Array.from(avatarObject.image_6n),
        image_7n: Array.from(avatarObject.image_7n),
        image_8n: Array.from(avatarObject.image_8n),
        image_9n: Array.from(avatarObject.image_9n),
      });

      const buffer = Buffer.from(serializedData, 'utf-8');
      const url = await this.s3Service.uploadObject(key, buffer, 'application/json');

      this.logger.log(`Avatar saved to S3: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to save avatar to S3: ${error.message}`, error);
      throw new Error(`Failed to save avatar to S3: ${error.message}`);
    }
  }

  /**
   * Загрузка аватара из S3
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<AvatarObject>} Объект аватара
   * @throws {NotFoundException} Если аватар не найден
   * @throws {Error} Если загрузка не удалась
   */
  async loadAvatar(id: string): Promise<AvatarObject> {
    if (!this.s3Service) {
      throw new Error('S3Service is not available. Check storage configuration.');
    }

    const key = `avatars/${id}.obj`;

    try {
      const exists = await this.s3Service.objectExists(key);
      if (!exists) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      const buffer = await this.s3Service.getObject(key);
      const fileContent = buffer.toString('utf-8');
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

      this.logger.log(`Avatar loaded from S3: ${key}`);
      return avatarObject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to load avatar from S3: ${error.message}`, error);
      throw new Error(`Failed to load avatar from S3: ${error.message}`);
    }
  }

  /**
   * Удаление аватара из S3
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<void>}
   * @throws {NotFoundException} Если аватар не найден
   * @throws {Error} Если удаление не удалось
   */
  async deleteAvatar(id: string): Promise<void> {
    if (!this.s3Service) {
      throw new Error('S3Service is not available. Check storage configuration.');
    }

    const key = `avatars/${id}.obj`;

    try {
      const exists = await this.s3Service.objectExists(key);
      if (!exists) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      await this.s3Service.deleteObject(key);
      this.logger.log(`Avatar deleted from S3: ${key}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete avatar from S3: ${error.message}`, error);
      throw new Error(`Failed to delete avatar from S3: ${error.message}`);
    }
  }

  /**
   * Проверка существования аватара в S3
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<boolean>} true если аватар существует
   */
  async exists(id: string): Promise<boolean> {
    if (!this.s3Service) {
      this.logger.warn('S3Service is not available. Returning false for exists check.');
      return false;
    }

    const key = `avatars/${id}.obj`;
    try {
      return await this.s3Service.objectExists(key);
    } catch (error) {
      this.logger.error(`Failed to check avatar existence in S3: ${error.message}`, error);
      return false;
    }
  }
}
