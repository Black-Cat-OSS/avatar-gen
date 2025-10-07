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
    // LoggerService constructor called - getting logging config
    const loggingConfig = this.configService.getLoggingConfig();
    // Logging config retrieved

    const logLevel = loggingConfig.level;
    const isVerbose = loggingConfig.verbose;
    const isPretty = loggingConfig.pretty;

    // В verbose режиме устанавливаем более детальный уровень логирования
    const effectiveLevel = isVerbose ? 'debug' : logLevel;

    // Определяем транспорт в зависимости от режима
    let transport: pino.TransportTargetOptions | pino.TransportMultiOptions | undefined;

    if (isPretty) {
      // Development: красивые логи в консоль
      transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          ...(isVerbose && {
            levelFirst: true,
            messageFormat: '{levelLabel} [{name}] {msg}',
          }),
        },
      };
    } else {
      // Production: логи в файл с ротацией + консоль
      transport = {
        targets: [
          {
            target: 'pino-roll',
            level: effectiveLevel,
            options: {
              file: './logs/app.log',
              frequency: 'daily',
              size: '10M',
              limit: {
                count: 7,
              },
              mkdir: true,
            },
          },
          {
            target: 'pino/file',
            level: effectiveLevel,
            options: {
              destination: 1, // stdout
            },
          },
        ],
      };
    }

    this.logger = pino({
      level: effectiveLevel,
      transport,
    });

    if (isVerbose) {
      this.logger.debug('Verbose logging enabled');
    }

    this.logger.info(
      `Logger initialized: level=${effectiveLevel}, pretty=${isPretty}, logFile=${!isPretty ? './logs/app.log' : 'none'}`,
    );
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
