import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { GeneratorModule } from './modules';

@Module({
  imports: [ConfigModule, DatabaseModule, StorageModule.register(), GeneratorModule],
  controllers: [AvatarController],
  providers: [AvatarService],
  exports: [AvatarService],
})
export class AvatarModule implements OnModuleInit {
  private readonly logger = new Logger(AvatarModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('AvatarModule initialized - Avatar generation services ready');
    } catch (error) {
      this.logger.error(
        `AvatarModule initialization failed: ${error.message}`,
        error.stack,
        'AvatarModule',
      );
      throw error;
    }
  }
}
