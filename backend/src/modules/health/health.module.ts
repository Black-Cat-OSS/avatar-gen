import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Модуль для проверки здоровья приложения
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
