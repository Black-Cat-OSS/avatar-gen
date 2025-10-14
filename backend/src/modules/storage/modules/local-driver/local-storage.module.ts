import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '../../../../config/config.module';
import { YamlConfigService } from '../../../../config/modules/yaml-driver/yaml-config.service';
import { LocalStorageService } from './local-storage.service';
import { IStorageModule } from '../../../../common/interfaces/storage-module.interface';
import { existsSync, mkdirSync } from 'fs';

/**
 * Модуль локального файлового хранилища
 *
 * Предоставляет сервисы для работы с локальной файловой системой.
 * Отвечает за инициализацию директорий хранилища.
 *
 * Реализует IStorageModule для интеграции с StorageModule.
 *
 * @module LocalStorageModule
 * @implements {IStorageModule}
 */
@Module({
  imports: [ConfigModule],
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class LocalStorageModule implements IStorageModule {
  private readonly logger = new Logger(LocalStorageModule.name);

  constructor(private readonly configService: YamlConfigService) {}

  //FIXME: initialization cannot be started if config define another...
  async onModuleInit(): Promise<void> {
    const storageConfig = this.configService.getStorageConfig();
    if (storageConfig.type !== 'local') {
      this.logger.debug(
        `Skipping LocalStorageModule initialization: storage type is ${storageConfig.type}`,
      );
      return;
    }

    try {
      await this.initializeLocalStorage();
      this.logger.log('LocalStorageModule initialized successfully');
    } catch (error) {
      this.logger.error(
        `LocalStorageModule initialization failed: ${error.message}`,
        error.stack,
        'LocalStorageModule',
      );
      throw error;
    }
  }

  /**
   * Инициализация локального хранилища
   *
   * Проверяет существование директории хранилища и создает её при необходимости.
   *
   * @private
   * @returns {Promise<void>}
   */
  private async initializeLocalStorage(): Promise<void> {
    const storageConfig = this.configService.getStorageConfig();
    const savePath = storageConfig.local?.save_path;

    if (!savePath) {
      throw new Error('Local storage path is not configured');
    }

    if (!existsSync(savePath)) {
      this.logger.warn(`Storage directory does not exist: ${savePath}`);
      this.logger.log(`Creating storage directory: ${savePath}`);
      mkdirSync(savePath, { recursive: true });
      this.logger.log(`Storage directory created: ${savePath}`);
    } else {
      this.logger.log(`Storage directory exists: ${savePath}`);
    }
  }
}
