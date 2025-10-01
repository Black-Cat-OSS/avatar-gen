#!/usr/bin/env node

/**
 * Скрипт для проверки состояния подключения к базе данных
 * Использование: node scripts/check-db-health.js
 */

const { PrismaClient } = require('@prisma/client');

// Цвета для консоли
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDatabaseHealth() {
  const prisma = new PrismaClient();
  
  try {
    log('Проверка подключения к базе данных...', 'blue');
    
    // Проверяем подключение
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const endTime = Date.now();
    
    log(`✓ База данных доступна (время ответа: ${endTime - startTime}ms)`, 'green');
    
    // Получаем информацию о базе данных
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version
    `;
    
    if (dbInfo && dbInfo.length > 0) {
      log('\nИнформация о базе данных:', 'blue');
      console.log(`  База данных: ${dbInfo[0].database_name || 'N/A'}`);
      console.log(`  Пользователь: ${dbInfo[0].current_user || 'N/A'}`);
      console.log(`  Версия: ${dbInfo[0].version || 'N/A'}`);
    }
    
    // Проверяем таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables && tables.length > 0) {
      log(`\nНайдено таблиц: ${tables.length}`, 'blue');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Проверяем таблицу avatars если она существует
    try {
      const avatarCount = await prisma.avatar.count();
      log(`\nЗаписей в таблице avatars: ${avatarCount}`, 'blue');
    } catch (error) {
      log('\nТаблица avatars не найдена или недоступна', 'yellow');
    }
    
  } catch (error) {
    log(`✗ Ошибка подключения к базе данных: ${error.message}`, 'red');
    
    // Предоставляем полезные советы
    log('\nВозможные решения:', 'yellow');
    console.log('  1. Убедитесь, что база данных запущена');
    console.log('  2. Проверьте переменные окружения DATABASE_URL и DATABASE_PROVIDER');
    console.log('  3. Для PostgreSQL убедитесь, что сервер доступен на указанном хосте и порту');
    console.log('  4. Для SQLite убедитесь, что файл базы данных существует и доступен');
    console.log('  5. Выполните миграции: npm run prisma:migrate');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем проверку
checkDatabaseHealth().catch(error => {
  log(`Неожиданная ошибка: ${error.message}`, 'red');
  process.exit(1);
});
