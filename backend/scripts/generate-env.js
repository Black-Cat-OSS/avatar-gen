#!/usr/bin/env node

/**
 * Скрипт для генерации .env файла из YAML конфигурации
 * Использование: node scripts/generate-env.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

function generateDatabaseUrl(config) {
  const { driver, sqlite_params, postgresql_params } = config.database;
  
  if (driver === 'sqlite') {
    return sqlite_params.url;
  } else if (driver === 'postgresql') {
    const { host, port, database, username, password, ssl } = postgresql_params;
    const sslParam = ssl ? '?sslmode=require' : '';
    return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
  }
  
  throw new Error(`Unsupported database driver: ${driver}`);
}

function generatePrismaSchema(driver) {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  
  const schemaTemplate = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${driver}"
  url      = env("DATABASE_URL")
}

model Avatar {
  id          String   @id @default(uuid())
  name        String
  createdAt   DateTime @default(now())
  version     String   @default("0.0.1")
  filePath    String   @unique
  primaryColor String?
  foreignColor String?
  colorScheme String?
  seed        String?
  
  @@map("avatars")
}
`;

  fs.writeFileSync(schemaPath, schemaTemplate);
  log(`✓ Prisma schema updated for ${driver}`, 'green');
}

function generateEnvFile() {
  try {
    const settingsPath = path.join(__dirname, '..', 'settings.yaml');
    const envPath = path.join(__dirname, '..', '.env');
    
    // Читаем YAML конфигурацию
    if (!fs.existsSync(settingsPath)) {
      throw new Error(`Settings file not found: ${settingsPath}`);
    }
    
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    const config = yaml.load(settingsContent);
    
    if (!config.app || !config.app.database) {
      throw new Error('Invalid configuration: missing app.database section');
    }
    
    const driver = config.app.database.driver;
    
    // Генерируем Prisma схему с правильным провайдером
    generatePrismaSchema(driver);
    
    // Генерируем переменные окружения
    const envVars = [
      '# Generated from settings.yaml',
      `DATABASE_URL="${generateDatabaseUrl(config.app)}"`,
      `CONFIG_PATH="./settings.yaml"`,
      '',
      '# You can override these values by setting environment variables',
      '# or by modifying settings.yaml and regenerating this file'
    ];
    
    // Записываем .env файл
    fs.writeFileSync(envPath, envVars.join('\n'));
    
    log('✓ .env file generated successfully from settings.yaml', 'green');
    log(`  DATABASE_PROVIDER: ${driver}`, 'blue');
    log(`  DATABASE_URL: ${generateDatabaseUrl(config.app)}`, 'blue');
    
  } catch (error) {
    log(`✗ Error generating .env file: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запускаем генерацию
generateEnvFile();
