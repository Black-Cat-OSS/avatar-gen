import { DataSource } from 'typeorm';
import { initializeDataSource } from './data-source';

/**
 * Простая функция логирования для standalone скрипта
 */
const log = (message: string, level: 'info' | 'error' | 'success' = 'info') => {
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : '🔄';
   
  log(`${prefix} ${message}`);
};

/**
 * Скрипт для запуска миграций базы данных
 * 
 * Использование:
 * - npm run migration:run - применить все миграции
 * - npm run migration:revert - откатить последнюю миграцию
 */
async function runMigrations() {
  let connection: DataSource;

  try {
    log('🔄 Инициализация источника данных...');
    connection = await initializeDataSource();

    log('🔄 Подключение к базе данных...');
    await connection.initialize();

    log('🔄 Запуск миграций...');
    const migrations = await connection.runMigrations();

    if (migrations.length === 0) {
      log('✅ Все миграции уже применены');
    } else {
      log(`✅ Применено ${migrations.length} миграций:`);
      migrations.forEach(migration => {
        log(`  - ${migration.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error);
    process.exit(1);
  } finally {
    if (connection?.isInitialized) {
      await connection.destroy();
      log('🔌 Соединение с базой данных закрыто');
    }
  }
}

/**
 * Скрипт для отката миграций
 */
async function revertMigrations() {
  let connection: DataSource;

  try {
    log('🔄 Инициализация источника данных...');
    connection = await initializeDataSource();

    log('🔄 Подключение к базе данных...');
    await connection.initialize();

    log('🔄 Откат последней миграции...');
    await connection.undoLastMigration();

    log('✅ Миграция откачена');

  } catch (error) {
    console.error('❌ Ошибка при откате миграции:', error);
    process.exit(1);
  } finally {
    if (connection?.isInitialized) {
      await connection.destroy();
      log('🔌 Соединение с базой данных закрыто');
    }
  }
}

// Обработка аргументов командной строки
const command = process.argv[2];

switch (command) {
  case 'run':
    runMigrations();
    break;
  case 'revert':
    revertMigrations();
    break;
  default:
    log('Использование:');
    log('  npm run migration:run   - применить все миграции');
    log('  npm run migration:revert - откатить последнюю миграцию');
    process.exit(1);
}
