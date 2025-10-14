import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { DatabaseModule } from '../database';
import { InitializationModule } from '../initialization';
import { AvatarModule } from '../avatar/avatar.module';
import { HealthModule } from '../health';

/**
 * Корневой модуль приложения
 *
 * Настраивает все модули и обеспечивает правильную инициализацию
 * всех компонентов приложения в правильном порядке.
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    InitializationModule,
    DatabaseModule,
    AvatarModule,
    HealthModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('AppModule initialized - All application modules loaded successfully');
    } catch (error) {
      this.logger.error(
        `AppModule initialization failed: ${error.message}`,
        error.stack,
        'AppModule',
      );
      throw error;
    }
  }
}
