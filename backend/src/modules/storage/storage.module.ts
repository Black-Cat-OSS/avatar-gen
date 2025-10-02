import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule implements OnModuleInit {
  private readonly logger = new Logger(StorageModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('StorageModule initialized - File storage services ready');
    } catch (error) {
      this.logger.error(
        `StorageModule initialization failed: ${error.message}`,
        error.stack,
        'StorageModule',
      );
      throw error;
    }
  }
}
