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
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Глубокое слияние объектов конфигурации
 * Аналогично YamlConfigService.deepMerge()
 */
function deepMerge(base, override) {
  const result = { ...base };

  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const baseValue = result[key];
      const overrideValue = override[key];

      if (
        baseValue &&
        overrideValue &&
        typeof baseValue === 'object' &&
        typeof overrideValue === 'object' &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
      ) {
        result[key] = deepMerge(baseValue, overrideValue);
      } else {
        result[key] = overrideValue;
      }
    }
  }

  return result;
}

function generateDatabaseUrl(config) {
  const { driver, sqlite_params, network } = config.database;

  if (driver === 'sqlite') {
    return sqlite_params.url;
  } else if (driver === 'postgresql') {
    const { host, port, database, username, password, ssl } = network;
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
    const backendDir = path.join(__dirname, '..');
    const settingsPath = path.join(backendDir, 'settings.yaml');
    const envPath = path.join(backendDir, '.env');

    // Читаем базовую YAML конфигурацию
    if (!fs.existsSync(settingsPath)) {
      throw new Error(`Settings file not found: ${settingsPath}`);
    }

    log(`Loading base configuration from: ${settingsPath}`, 'blue');
    const baseSettingsContent = fs.readFileSync(settingsPath, 'utf8');
    const baseConfig = yaml.load(baseSettingsContent);

    if (!baseConfig.app || !baseConfig.app.database) {
      throw new Error('Invalid configuration: missing app.database section');
    }

    let finalConfig = baseConfig;

    // Проверяем NODE_ENV и загружаем environment-specific конфигурацию
    const nodeEnv = process.env.NODE_ENV;
    log(`Current NODE_ENV: ${nodeEnv || 'not set'}`, 'blue');

    if (nodeEnv && ['development', 'production', 'test'].includes(nodeEnv)) {
      const envSettingsPath = path.join(backendDir, `settings.${nodeEnv}.yaml`);
      log(`Looking for environment config at: ${envSettingsPath}`, 'blue');

      if (fs.existsSync(envSettingsPath)) {
        log(`Loading environment-specific configuration from: ${envSettingsPath}`, 'green');
        const envSettingsContent = fs.readFileSync(envSettingsPath, 'utf8');
        const envConfig = yaml.load(envSettingsContent);

        // Мержим конфигурации, где envConfig переопределяет baseConfig
        finalConfig = deepMerge(baseConfig, envConfig);
        log('Environment-specific configuration merged successfully', 'green');
      } else {
        log(`Environment config not found, using base configuration only`, 'yellow');
      }
    } else {
      log('No valid NODE_ENV set, using base configuration only', 'yellow');
    }

    if (!finalConfig.app || !finalConfig.app.database) {
      throw new Error('Invalid merged configuration: missing app.database section');
    }

    const driver = finalConfig.app.database.driver;

    // Генерируем Prisma схему с правильным провайдером
    generatePrismaSchema(driver);

    // Генерируем переменные окружения
    const databaseUrl = generateDatabaseUrl(finalConfig.app);
    const envVars = [
      '# Generated from settings.yaml',
      nodeEnv ? `# Environment: ${nodeEnv}` : '# Environment: default',
      `DATABASE_URL="${databaseUrl}"`,
      `CONFIG_PATH="./settings.yaml"`,
      '',
      '# You can override these values by setting environment variables',
      '# or by modifying settings.yaml and regenerating this file',
    ];

    // Записываем .env файл
    fs.writeFileSync(envPath, envVars.join('\n'));

    log('✓ .env file generated successfully', 'green');
    log(`  Environment: ${nodeEnv || 'default'}`, 'blue');
    log(`  Database Provider: ${driver}`, 'blue');
    log(`  Database URL: ${databaseUrl}`, 'blue');
  } catch (error) {
    log(`✗ Error generating .env file: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Запускаем генерацию
generateEnvFile();
