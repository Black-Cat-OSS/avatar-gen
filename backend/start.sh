#!/bin/sh
set -e

echo "=== Avatar Generator Backend Startup ==="

# Генерируем .env файл из YAML конфигурации
echo "🔧 Generating .env file from YAML configuration..."

# Используем prisma-runner.js для генерации DATABASE_URL
# Создаем временный скрипт для получения DATABASE_URL
cat > /tmp/get-db-url.js << 'EOF'
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function deepMerge(base, override) {
  const result = { ...base };
  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const baseValue = result[key];
      const overrideValue = override[key];
      if (baseValue && overrideValue && typeof baseValue === 'object' && typeof overrideValue === 'object' && !Array.isArray(baseValue) && !Array.isArray(overrideValue)) {
        result[key] = deepMerge(baseValue, overrideValue);
      } else {
        result[key] = overrideValue;
      }
    }
  }
  return result;
}

function resolveEnvVariables(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\$\{([^}:]+)(?::-(.[^}]*))?\}/g, (match, varName, defaultValue) => {
    return process.env[varName] || defaultValue || '';
  });
}

function resolveConfigEnvVariables(obj) {
  if (typeof obj === 'string') return resolveEnvVariables(obj);
  if (Array.isArray(obj)) return obj.map(item => resolveConfigEnvVariables(item));
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

function loadConfig() {
  const backendDir = process.cwd();
  const baseConfigPath = process.env.CONFIG_PATH || path.join(backendDir, 'settings.yaml');
  
  let configPath = baseConfigPath;
  const testMatrixConfig = process.env.TEST_MATRIX_CONFIG;
  if (testMatrixConfig && fs.existsSync(testMatrixConfig)) {
    configPath = testMatrixConfig;
  }
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const baseContent = fs.readFileSync(configPath, 'utf8');
  let config = yaml.load(baseContent);
  
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (['development', 'production', 'test'].includes(nodeEnv)) {
    const envConfigPath = path.join(backendDir, `settings.${nodeEnv}.yaml`);
    if (fs.existsSync(envConfigPath)) {
      const envContent = fs.readFileSync(envConfigPath, 'utf8');
      const envConfig = yaml.load(envContent);
      config = deepMerge(config, envConfig);
    }
    
    const localConfigPath = path.join(backendDir, `settings.${nodeEnv}.local.yaml`);
    if (fs.existsSync(localConfigPath)) {
      const localContent = fs.readFileSync(localConfigPath, 'utf8');
      const localConfig = yaml.load(localContent);
      config = deepMerge(config, localConfig);
    }
  }
  
  config = resolveConfigEnvVariables(config);
  return config;
}

function generateDatabaseUrl(config) {
  const { driver, sqlite_params, postgresql_params, network } = config.app.database;

  if (driver === 'sqlite') {
    return sqlite_params.url;
  } else if (driver === 'postgresql') {
    if (postgresql_params?.url) {
      return postgresql_params.url;
    } else {
      const { host, port, database, username, password, ssl } = network;
      const sslParam = ssl ? '?sslmode=require' : '?sslmode=disable';
      return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
    }
  }

  throw new Error(`Unsupported database driver: ${driver}`);
}

try {
  const config = loadConfig();
  const databaseUrl = generateDatabaseUrl(config);
  const driver = config.app.database.driver;
  
  console.log(`Database Provider: ${driver}`);
  console.log(`Database URL: ${databaseUrl}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
EOF

# Запускаем скрипт для получения DATABASE_URL
DB_INFO=$(node /tmp/get-db-url.js)
DATABASE_PROVIDER=$(echo "$DB_INFO" | grep "Database Provider:" | cut -d' ' -f3)
DATABASE_URL=$(echo "$DB_INFO" | grep "Database URL:" | cut -d' ' -f3-)

echo "📋 Database provider from config: $DATABASE_PROVIDER"
echo "📦 Database Provider: $DATABASE_PROVIDER"
echo "🔗 Database URL: ${DATABASE_URL:0:30}..." # Показываем только начало URL (безопасность)

# Генерируем .env файл
echo "📝 Creating .env file..."
cat > .env << EOF
# Generated automatically from YAML configuration
DATABASE_URL="$DATABASE_URL"
NODE_ENV=${NODE_ENV:-development}
EOF

echo "✅ .env file generated successfully"

# Выбираем правильный schema.prisma на основе провайдера
if [ "$DATABASE_PROVIDER" = "postgresql" ]; then
  echo "📄 Using PostgreSQL schema..."
  cp /app/prisma/schema.postgresql.prisma /app/prisma/schema.prisma
elif [ "$DATABASE_PROVIDER" = "sqlite" ]; then
  echo "📄 Using SQLite schema..."
  cp /app/prisma/schema.sqlite.prisma /app/prisma/schema.prisma
else
  echo "❌ Error: Unsupported DATABASE_PROVIDER: $DATABASE_PROVIDER"
  echo "Supported values: sqlite, postgresql"
  exit 1
fi

# Удаляем весь старый Prisma Client (критично для переключения provider)
echo "🧹 Cleaning old Prisma Client cache..."
rm -rf /app/node_modules/.prisma/client
rm -rf /app/node_modules/@prisma/client/.prisma

# Генерируем Prisma Client с правильным provider
echo "🔧 Generating Prisma Client for $DATABASE_PROVIDER..."
npx prisma generate --schema=/app/prisma/schema.prisma

# Проверяем что новый client сгенерирован
if [ ! -f "/app/node_modules/.prisma/client/index.js" ]; then
  echo "❌ Error: Prisma Client generation failed"
  exit 1
fi

echo "✅ Prisma Client generated successfully"

# Синхронизируем схему базы данных
# Используем db push вместо migrate deploy для контейнеров,
# так как это работает с обоими провайдерами автоматически
echo "🗄️  Synchronizing database schema..."
npx prisma db push --accept-data-loss --skip-generate

# Запускаем приложение
echo "🚀 Starting avatar generator application..."
exec node dist/main.js
