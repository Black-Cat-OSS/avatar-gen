#!/usr/bin/env node

/**
 * Утилита для запуска Prisma команд с DATABASE_URL из YAML конфигурации
 * 
 * Использование:
 *   node scripts/prisma-runner.js generate
 *   node scripts/prisma-runner.js migrate dev
 *   node scripts/prisma-runner.js migrate deploy
 *   node scripts/prisma-runner.js studio
 *   node scripts/prisma-runner.js migrate reset
 * 
 * @see https://stackoverflow.com/a/22312745
 * @see https://stackoverflow.com/a/52337016
 */

const { spawn } = require('child_process');
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

/**
 * Заменяет переменные окружения в строке (формат: ${VAR_NAME} или ${VAR_NAME:-default})
 */
function resolveEnvVariables(str) {
  if (typeof str !== 'string') return str;
  
  return str.replace(/\$\{([^}:]+)(?::-(.[^}]*))?\}/g, (match, varName, defaultValue) => {
    return process.env[varName] || defaultValue || '';
  });
}

/**
 * Рекурсивно обрабатывает объект, заменяя переменные окружения во всех строках
 */
function resolveConfigEnvVariables(obj) {
  if (typeof obj === 'string') {
    return resolveEnvVariables(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveConfigEnvVariables(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = resolveConfigEnvVariables(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

/**
 * Загружает и объединяет YAML конфигурацию
 */
function loadConfig() {
  const backendDir = path.join(__dirname, '..');
  const baseConfigPath = process.env.CONFIG_PATH || path.join(backendDir, 'settings.yaml');
  
  // Для тестов может быть специальный конфиг
  let configPath = baseConfigPath;
  const testMatrixConfig = process.env.TEST_MATRIX_CONFIG;
  if (testMatrixConfig && fs.existsSync(testMatrixConfig)) {
    configPath = testMatrixConfig;
    log(`Using test matrix config: ${configPath}`, 'yellow');
  }
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  log(`Loading base configuration from: ${configPath}`, 'blue');
  const baseContent = fs.readFileSync(configPath, 'utf8');
  let config = yaml.load(baseContent);
  
  // Определяем окружение
  const nodeEnv = process.env.NODE_ENV || 'development';
  log(`Current NODE_ENV: ${nodeEnv}`, 'blue');

  // Загружаем environment-specific конфигурацию
  if (['development', 'production', 'test'].includes(nodeEnv)) {
    const envConfigPath = path.join(backendDir, `settings.${nodeEnv}.yaml`);
    
    if (fs.existsSync(envConfigPath)) {
      log(`Loading environment config: ${envConfigPath}`, 'green');
      const envContent = fs.readFileSync(envConfigPath, 'utf8');
      const envConfig = yaml.load(envContent);
      config = deepMerge(config, envConfig);
    }
    
    // Загружаем локальные переопределения
    const localConfigPath = path.join(backendDir, `settings.${nodeEnv}.local.yaml`);
    if (fs.existsSync(localConfigPath)) {
      log(`Loading local overrides: ${localConfigPath}`, 'green');
      const localContent = fs.readFileSync(localConfigPath, 'utf8');
      const localConfig = yaml.load(localContent);
      config = deepMerge(config, localConfig);
    }
  }
  
  // Резолвим ENV переменные в конфигурации
  config = resolveConfigEnvVariables(config);
  
  return config;
}

/**
 * Генерирует DATABASE_URL из конфигурации
 */
function generateDatabaseUrl(config) {
  const { driver, sqlite_params, network } = config.app.database;

  if (driver === 'sqlite') {
    return sqlite_params.url;
  } else if (driver === 'postgresql') {
    const { host, port, database, username, password, ssl } = network;
    const sslParam = ssl ? '?sslmode=require' : '';
    return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
  }

  throw new Error(`Unsupported database driver: ${driver}`);
}

/**
 * Запускает Prisma команду с правильным DATABASE_URL
 */
function runPrismaCommand(args) {
  try {
    const config = loadConfig();
    const databaseUrl = generateDatabaseUrl(config);
    const driver = config.app.database.driver;

    log(`Database Provider: ${driver}`, 'blue');
    log(`Database URL: ${databaseUrl}`, 'blue');
    log(`Running command: prisma ${args.join(' ')}`, 'green');
    log('', 'reset');

    // Устанавливаем DATABASE_URL в process.env
    process.env.DATABASE_URL = databaseUrl;

    // Запускаем Prisma команду
    const prisma = spawn('npx', ['prisma', ...args], {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      shell: true,
    });

    prisma.on('close', (code) => {
      if (code !== 0) {
        log(`\n✗ Prisma command failed with exit code ${code}`, 'red');
        process.exit(code);
      } else {
        log(`\n✓ Prisma command completed successfully`, 'green');
        process.exit(0);
      }
    });

    prisma.on('error', (error) => {
      log(`✗ Failed to run Prisma command: ${error.message}`, 'red');
      process.exit(1);
    });

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Получаем аргументы командной строки (все кроме node и script path)
const args = process.argv.slice(2);

if (args.length === 0) {
  log('Usage: node scripts/prisma-runner.js <prisma-command> [args...]', 'yellow');
  log('Examples:', 'blue');
  log('  node scripts/prisma-runner.js generate', 'reset');
  log('  node scripts/prisma-runner.js migrate dev', 'reset');
  log('  node scripts/prisma-runner.js migrate deploy', 'reset');
  log('  node scripts/prisma-runner.js studio', 'reset');
  process.exit(1);
}

// Запускаем Prisma команду
runPrismaCommand(args);

