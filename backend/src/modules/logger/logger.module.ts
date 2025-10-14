import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements OnModuleInit {
  private readonly logger = new Logger(LoggerModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('LoggerModule initialized - Logging service ready');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`LoggerModule initialization failed: ${error.message}`, error);
      throw error;
    }
  }
}
