import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { InitializationModule } from '../initialization';
import { DatabaseModule } from '../database';
import { LoggerModule } from '../logger/logger.module';
import { AvatarModule } from '../avatar/avatar.module';

/**
 * Корневой модуль приложения
 *
 * Настраивает все модули и обеспечивает правильную инициализацию
 * всех компонентов приложения в правильном порядке.
 */
@Module({
  imports: [
    ConfigModule,
    InitializationModule, // ← Модуль инициализации (должен быть первым)
    DatabaseModule,
    LoggerModule,
    AvatarModule,
  ],
})
export class AppModule {}
