import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { Configuration, validateConfig } from './configuration';

@Injectable()
export class YamlConfigService {
  private readonly logger = new Logger(YamlConfigService.name);
  private config: Configuration;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = process.env.CONFIG_PATH || join(process.cwd(), 'settings.yaml');
      this.logger.log(`Loading configuration from: ${configPath}`);

      const fileContents = readFileSync(configPath, 'utf8');
      const rawConfig = yaml.load(fileContents);

      this.config = validateConfig(rawConfig);
      this.logger.log('Configuration loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load configuration', error);
      throw new Error(`Configuration loading failed: ${error.message}`);
    }
  }

  getConfig(): Configuration {
    return this.config;
  }

  getSavePath(): string {
    return this.config.app.save_path;
  }

  getServerConfig() {
    return this.config.app.server;
  }

  getDatabaseConfig() {
    return this.config.app.database;
  }
}
