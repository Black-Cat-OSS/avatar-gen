import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

