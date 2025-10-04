import { Injectable, Logger } from '@nestjs/common';
import { AvatarObject } from '../../common/interfaces/avatar-object.interface';
import { IStorageStrategy } from '../../common/interfaces/storage-strategy.interface';
import { YamlConfigService } from '../../config/yaml-config.service';
import { LocalStorageService } from './modules/local';
import { S3StorageService } from './modules/s3';

/**
 * Сервис хранилища аватаров
 *
 * Использует паттерн Strategy для поддержки различных типов хранилищ (local, s3).
 * Выбор стратегии происходит в конструкторе на основе конфигурации.
 *
 * StorageService является singleton и инициализируется один раз при старте приложения.
 *
 * @class StorageService
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly strategy: IStorageStrategy;

  constructor(
    private readonly configService: YamlConfigService,
    localStorageService: LocalStorageService,
    s3StorageService: S3StorageService,
  ) {
    const storageConfig = this.configService.getStorageConfig();
    const storageType = storageConfig.type;

    if (storageType === 's3') {
      if (!s3StorageService) {
        throw new Error('S3StorageService is not available but configured as storage type');
      }
      this.strategy = s3StorageService;
      this.logger.log('Using S3 storage strategy');
    } else {
      if (!localStorageService) {
        throw new Error('LocalStorageService is not available but configured as storage type');
      }
      this.strategy = localStorageService;
      this.logger.log('Using local storage strategy');
    }

    this.logger.log(`StorageService initialized with ${this.getStorageType()} storage`);
  }

  /**
   * Сохранение аватара
   *
   * @param {AvatarObject} avatarObject - Объект аватара для сохранения
   * @returns {Promise<string>} Путь или URL сохраненного аватара
   * @throws {Error} Если сохранение не удалось
   */
  async saveAvatar(avatarObject: AvatarObject): Promise<string> {
    return this.strategy.saveAvatar(avatarObject);
  }

  /**
   * Загрузка аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<AvatarObject>} Объект аватара
   * @throws {Error} Если аватар не найден или загрузка не удалась
   */
  async loadAvatar(id: string): Promise<AvatarObject> {
    return this.strategy.loadAvatar(id);
  }

  /**
   * Удаление аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<void>}
   * @throws {Error} Если удаление не удалось
   */
  async deleteAvatar(id: string): Promise<void> {
    return this.strategy.deleteAvatar(id);
  }

  /**
   * Проверка существования аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<boolean>} true если аватар существует
   */
  async exists(id: string): Promise<boolean> {
    return this.strategy.exists(id);
  }

  /**
   * Получение типа используемого хранилища
   *
   * @returns {string} Тип хранилища ('local' или 's3')
   */
  getStorageType(): string {
    return this.configService.getStorageConfig().type;
  }
}
