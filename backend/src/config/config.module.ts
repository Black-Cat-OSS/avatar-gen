import { Module } from '@nestjs/common';
import { YamlConfigService } from './yaml-config.service';

@Module({
  providers: [YamlConfigService],
  exports: [YamlConfigService],
})
export class ConfigModule {}
