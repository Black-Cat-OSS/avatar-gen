import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../modules/database/database.service';

/**
 * Основная команда для управления миграциями базы данных
 * 
 * Предоставляет единый интерфейс для выполнения различных операций
 * с миграциями базы данных через Nest Commander.
 * 
 * @example
 * ```bash
 * # Запуск миграций
 * npm run migration run
 * 
 * # Откат последней миграции
 * npm run migration revert
 * 
 * # Статус миграций
 * npm run migration status
 * ```
 */
@Injectable()
@Command({
  name: 'migration',
  description: 'Database migration commands',
})
export class MigrationCommand extends CommandRunner {
  private readonly logger = new Logger(MigrationCommand.name);

  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async run(passedParams: string[], _options?: Record<string, unknown>): Promise<void> {
    const command = passedParams[0];

    switch (command) {
      case 'run':
        await this.runMigrations();
        break;
      case 'revert':
        await this.revertMigration();
        break;
      case 'status':
        await this.showStatus();
        break;
      default:
        this.showHelp();
    }
  }

  private async runMigrations(): Promise<void> {
    try {
        this.logger.log('🔄 Running database migrations...');
      const migrations = await this.databaseService.runMigrations();

      if (migrations.length === 0) {
        this.logger.log('✅ All migrations are already applied');
      } else {
        this.logger.log(`✅ Applied ${migrations.length} migrations:`);
        migrations.forEach(migration => {
          this.logger.log(`  - ${migration.name}`);
        });
        this.logger.log('🎉 Migration process completed successfully!');
      }
    } catch (error) {
      console.error('❌ Error running migrations:', error.message);
      console.error('📋 Full error details:', error);
      process.exit(1);
    }
  }

  private async revertMigration(): Promise<void> {
    try {
      this.logger.log('🔄 Reverting last migration...');
      await this.databaseService.revertLastMigration();
      this.logger.log('✅ Migration reverted successfully');
    } catch (error) {
      console.error('❌ Error reverting migration:', error.message);
      process.exit(1);
    }
  }

  private async showStatus(): Promise<void> {
    try {
      this.logger.log('📊 Migration Status:');
      const status = await this.databaseService.getMigrationStatus();

      this.logger.log(`\n✅ Executed migrations (${status.executed.length}):`);
      if (status.executed.length === 0) {
        this.logger.log('  No migrations have been executed yet');
      } else {
        status.executed.forEach(migration => {
          this.logger.log(`  - ${migration.name} (${new Date(migration.timestamp).toLocaleString()})`);
        });
      }

      this.logger.log(`\n⏳ Pending migrations: ${status.pending ? 'Yes' : 'No'}`);
      if (!status.pending) {
        this.logger.log('  No pending migrations');
      } else {
        this.logger.log('  There are pending migrations to run');
      }
    } catch (error) {
      console.error('❌ Error getting migration status:', error.message);
      process.exit(1);
    }
  }

  private showHelp(): void {
    this.logger.log('📋 Available migration commands:');
    this.logger.log('  run     - Run pending migrations');
    this.logger.log('  revert  - Revert last migration');
    this.logger.log('  status  - Show migration status');
    this.logger.log('');
    this.logger.log('Use: npm run migration <command>');
    this.logger.log('');
    this.logger.log('Examples:');
    this.logger.log('  npm run migration run');
    this.logger.log('  npm run migration revert');
    this.logger.log('  npm run migration status');
  }
}
