import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { YamlConfigService } from './modules/yaml-driver/yaml-config.service';
import { ConfigurationBuilder } from './modules/yaml-driver/builders/configuration.builder';
import { FileReaderService } from './modules/yaml-driver/services/file-reader.service';
import { ConfigMergerService } from './modules/yaml-driver/services/config-merger.service';
import { YamlFileStrategy } from './modules/yaml-driver/strategies/yaml-file.strategy';

@Module({
  providers: [
    YamlConfigService,
    ConfigurationBuilder,
    FileReaderService,
    ConfigMergerService,
    YamlFileStrategy,
  ],
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
