#!/usr/bin/env node

/**
 * Скрипт для переключения между SQLite и PostgreSQL
 * Использование: node scripts/switch-db.js [sqlite|postgresql]
 */

const fs = require('fs');
const path = require('path');

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

function printUsage() {
  log('Использование:', 'blue');
  console.log('  node scripts/switch-db.js [sqlite|postgresql]');
  console.log('');
  log('Примеры:', 'blue');
  console.log('  node scripts/switch-db.js sqlite      # Переключиться на SQLite');
  console.log('  node scripts/switch-db.js postgresql  # Переключиться на PostgreSQL');
}

function switchToSQLite() {
  log('Переключение на SQLite...', 'yellow');
  
  const settingsPath = path.join(__dirname, '..', 'settings.yaml');
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Обновляем settings.yaml
    let settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settingsContent = settingsContent.replace(/driver: "postgresql"/, 'driver: "sqlite"');
    fs.writeFileSync(settingsPath, settingsContent);
    
    // Обновляем .env файл если существует
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/DATABASE_PROVIDER="postgresql"/, 'DATABASE_PROVIDER="sqlite"');
      envContent = envContent.replace(/DATABASE_URL="postgresql:.*"/, 'DATABASE_URL="file:./prisma/storage/database.sqlite"');
      fs.writeFileSync(envPath, envContent);
    }
    
    log('✓ Переключено на SQLite', 'green');
    log('Теперь можно запустить:', 'blue');
    console.log('  npm run prisma:generate');
    console.log('  npm run prisma:migrate');
    console.log('  npm run start:dev');
    
  } catch (error) {
    log(`Ошибка при переключении на SQLite: ${error.message}`, 'red');
    process.exit(1);
  }
}

function switchToPostgreSQL() {
  log('Переключение на PostgreSQL...', 'yellow');
  
  const settingsPath = path.join(__dirname, '..', 'settings.yaml');
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Обновляем settings.yaml
    let settingsContent = fs.readFileSync(settingsPath, 'utf8');
    settingsContent = settingsContent.replace(/driver: "sqlite"/, 'driver: "postgresql"');
    fs.writeFileSync(settingsPath, settingsContent);
    
    // Обновляем .env файл если существует
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/DATABASE_PROVIDER="sqlite"/, 'DATABASE_PROVIDER="postgresql"');
      envContent = envContent.replace(/DATABASE_URL="file:.*"/, 'DATABASE_URL="postgresql://postgres:password@localhost:5432/avatar_gen"');
      fs.writeFileSync(envPath, envContent);
    }
    
    log('✓ Переключено на PostgreSQL', 'green');
    log('Убедитесь, что PostgreSQL запущен и доступен', 'blue');
    log('Теперь можно запустить:', 'blue');
    console.log('  npm run prisma:generate');
    console.log('  npm run prisma:migrate');
    console.log('  npm run start:dev');
    
  } catch (error) {
    log(`Ошибка при переключении на PostgreSQL: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Проверяем аргументы
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(1);
}

const dbType = args[0];

switch (dbType) {
  case 'sqlite':
    switchToSQLite();
    break;
  case 'postgresql':
    switchToPostgreSQL();
    break;
  default:
    log(`Ошибка: Неизвестный тип базы данных '${dbType}'`, 'red');
    printUsage();
    process.exit(1);
}
