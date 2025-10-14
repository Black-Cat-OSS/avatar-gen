import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { YamlConfigService } from '../../config/modules/yaml-driver/yaml-config.service';
import { S3Service } from './s3.service';

/**
 * Модуль для работы с S3-совместимым хранилищем
 *
 * Предоставляет низкоуровневый API для работы с S3.
 * Может использоваться различными модулями для хранения данных в S3.
 *
 * @module S3Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Service,
      useFactory: (configService: YamlConfigService) => {
        const storageConfig = configService.getStorageConfig();

        if (storageConfig.type !== 's3' || !storageConfig.s3) {
          return null;
        }

        return new S3Service({
          app: {
            storage: {
              s3: storageConfig.s3,
            },
          },
        });
      },
      inject: [YamlConfigService],
    },
  ],
  exports: [S3Service],
})
export class S3Module {}
