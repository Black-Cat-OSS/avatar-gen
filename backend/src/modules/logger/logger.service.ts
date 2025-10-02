import { Injectable, LoggerService as NestLoggerService, Inject } from '@nestjs/common';
import pino from 'pino';
import { YamlConfigService } from '../../config/yaml-config.service';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor(
    @Inject(YamlConfigService)
    private readonly configService: YamlConfigService,
  ) {
    console.log('[LoggerService] Constructor called - getting logging config...');
    const loggingConfig = this.configService.getLoggingConfig();
    console.log('[LoggerService] Logging config retrieved:', JSON.stringify(loggingConfig));

    const logLevel = loggingConfig.level;
    const isVerbose = loggingConfig.verbose;

    // В verbose режиме устанавливаем более детальный уровень логирования
    const effectiveLevel = isVerbose ? 'debug' : logLevel;

    this.logger = pino({
      level: effectiveLevel,
      transport: loggingConfig.pretty
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              // В verbose режиме показываем больше деталей
              ...(isVerbose && {
                levelFirst: true,
                messageFormat: '{levelLabel} [{name}] {msg}',
              }),
            },
          }
        : undefined,
    });

    if (isVerbose) {
      this.logger.debug('Verbose logging enabled');
    }
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }
}
