import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { GeneratorModule } from './modules';

@Module({
  imports: [ConfigModule, DatabaseModule, StorageModule, GeneratorModule],
  controllers: [AvatarController],
  providers: [AvatarService],
  exports: [AvatarService],
})
export class AvatarModule {}
