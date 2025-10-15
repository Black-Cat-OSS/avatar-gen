import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CorsMiddleware } from './cors.middleware';
import { ConfigModule } from '../../config/config.module';

/**
 * Модуль для настройки CORS middleware
 */
@Module({
  imports: [ConfigModule],
  providers: [CorsMiddleware],
  exports: [CorsMiddleware],
})
export class CorsMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Применяем CORS middleware глобально ко всем маршрутам
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}
