import { CommandFactory } from 'nest-commander';
import { MigrationCommandModule } from './migration.module';

/**
 * Главный файл для запуска команд миграций
 * 
 * Создает NestJS приложение с модулем команд миграций
 * и запускает соответствующие команды через Nest Commander.
 */
async function bootstrap() {
  await CommandFactory.run(MigrationCommandModule, {
    logger: ['error', 'warn', 'log'],
  });
}

// Запускаем приложение
bootstrap().catch((error) => {
  console.error('❌ Failed to run migration commands:', error);
  process.exit(1);
});
