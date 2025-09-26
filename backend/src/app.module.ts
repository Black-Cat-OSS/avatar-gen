import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { LoggerModule } from './modules/logger/logger.module';
import { AvatarModule } from './modules/avatar/avatar.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    AvatarModule,
  ],
})
export class AppModule {}

