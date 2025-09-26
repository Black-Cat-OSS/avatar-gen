import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { AvatarGeneratorService } from './avatar-generator.service';
import { AvatarStorageService } from './avatar-storage.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AvatarController],
  providers: [AvatarService, AvatarGeneratorService, AvatarStorageService],
  exports: [AvatarService],
})
export class AvatarModule {}

