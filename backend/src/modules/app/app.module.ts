import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { AvatarModule } from '../avatar/avatar.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    AvatarModule,
  ],
})
export class AppModule {}

