import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { MigrationCommand } from './migration.command';
import { DatabaseModule } from '../../modules/database/database.module';

/**
 * Модуль для команд миграций базы данных
 * 
 * Предоставляет CLI команды для управления миграциями через Nest Commander.
 * Интегрируется с DatabaseModule для доступа к сервисам базы данных.
 * 
 * @example
 * ```bash
 * # Запуск миграций
 * npm run migration run
 * 
 * # Откат миграции
 * npm run migration revert
 * 
 * # Статус миграций
 * npm run migration status
 * ```
 */
@Module({
  imports: [
    CommandRunnerModule,
    DatabaseModule,
  ],
  providers: [
    MigrationCommand,
  ],
})
export class MigrationCommandModule {}
