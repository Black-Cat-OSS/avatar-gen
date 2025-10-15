import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { YamlConfigService } from '../../config/modules/yaml-driver/yaml-config.service';

/**
 * Middleware для обработки CORS запросов
 * 
 * Автоматически обрабатывает CORS заголовки на основе конфигурации
 * и применяет соответствующие правила для разрешенных источников.
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
  private readonly corsConfig: {
    enabled: boolean;
    origins: string[];
  };

  constructor(private readonly configService: YamlConfigService) {
    this.corsConfig = this.configService.getCorsConfig();
    this.logger.debug('CORS middleware initialized');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Если CORS отключен, пропускаем
    if (!this.corsConfig.enabled) {
      next();
      return;
    }

    const origin = req.headers.origin;
    const allowedOrigins = this.getAllowedOrigins();

    // Проверяем, разрешен ли источник
    if (this.isOriginAllowed(origin, allowedOrigins)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }

    // Устанавливаем остальные CORS заголовки
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 часа

    // Обрабатываем preflight запросы
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }

  /**
   * Получить список разрешенных источников
   */
  private getAllowedOrigins(): string[] {
    if (!this.corsConfig.enabled) {
      return [];
    }

    // Если массив пустой, разрешаем все
    if (this.corsConfig.origins.length === 0) {
      return ['*'];
    }

    return this.corsConfig.origins;
  }

  /**
   * Проверить, разрешен ли источник
   */
  private isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
    if (!origin) {
      return false;
    }

    // Если разрешены все источники
    if (allowedOrigins.includes('*')) {
      return true;
    }

    // Проверяем точное совпадение
    return allowedOrigins.includes(origin);
  }
}
