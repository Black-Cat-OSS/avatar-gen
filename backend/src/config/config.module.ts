import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { YamlConfigService } from './yaml-config.service';

@Module({
  providers: [YamlConfigService],
  exports: [YamlConfigService],
})
export class ConfigModule implements OnModuleInit {
  private readonly logger = new Logger(ConfigModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('ConfigModule initialized - Configuration service ready');
    } catch (error) {
      this.logger.error(
        `ConfigModule initialization failed: ${error.message}`,
        error.stack,
        'ConfigModule',
      );
      throw error;
    }
  }
}
