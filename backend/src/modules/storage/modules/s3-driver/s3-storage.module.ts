import { Module, Logger, Optional } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { S3Module, S3Service } from '../../../s3';
import { IStorageModule } from '../../../../common/interfaces/storage-module.interface';

/**
 * Модуль хранилища аватаров в S3
 *
 * Использует общий S3Module для low-level операций с S3.
 * Предоставляет high-level API для работы с аватарами.
 *
 * **Важно**: S3Service может быть null, если storage.type !== 's3'.
 * В этом случае модуль пропускает инициализацию.
 *
 * Реализует IStorageModule для интеграции с StorageModule.
 *
 * @module S3StorageModule
 * @implements {IStorageModule}
 */
@Module({
  imports: [S3Module],
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class S3StorageModule implements IStorageModule {
  private readonly logger = new Logger(S3StorageModule.name);

  constructor(@Optional() private readonly s3Service: S3Service) {}

  async onModuleInit(): Promise<void> {
    if (!this.s3Service) {
      this.logger.debug('S3Service not available, skipping S3StorageModule initialization');
      return;
    }

    try {
      await this.initializeS3Storage();
      this.logger.log('S3StorageModule initialized successfully');
    } catch (error) {
      this.logger.error(
        `S3StorageModule initialization failed: ${error.message}`,
        error.stack,
        'S3StorageModule',
      );
      throw error;
    }
  }

  /**
   * Инициализация S3 хранилища аватаров
   *
   * Проверяет что S3 модуль инициализирован и готов к работе.
   *
   * @private
   * @returns {Promise<void>}
   */
  private async initializeS3Storage(): Promise<void> {
    const s3Info = this.s3Service.getS3Info();
    this.logger.log(
      `S3 storage for avatars ready: ${s3Info.endpoint}/${s3Info.bucket} (region: ${s3Info.region})`,
    );
  }
}
