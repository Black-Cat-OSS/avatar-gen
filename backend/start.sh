#!/bin/sh
set -e

echo "=== Avatar Generator Backend Startup ==="

# Генерируем .env файл из YAML конфигурации
echo "🔧 Generating .env file from YAML configuration..."

# Используем существующий prisma-runner.js для генерации DATABASE_URL
echo "🔍 Loading configuration and generating DATABASE_URL..."

# Запускаем prisma-runner.js для получения DATABASE_URL
echo "🔍 Running prisma-runner.js to get database configuration..."
DB_INFO=$(node scripts/prisma-runner.js generate 2>&1)
EXIT_CODE=$?
echo "🔍 prisma-runner.js exit code: $EXIT_CODE"
echo "🔍 prisma-runner.js output:"
echo "$DB_INFO"
echo "🔍 End of prisma-runner.js output"

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Error running prisma-runner.js:"
  echo "$DB_INFO"
  exit 1
fi

# Извлекаем информацию о провайдере и URL
DATABASE_PROVIDER=$(echo "$DB_INFO" | grep "Database Provider:" | awk '{print $3}')
DATABASE_URL=$(echo "$DB_INFO" | grep "Database URL:" | awk '{print $3}')

# Проверяем что мы получили нужную информацию
if [ -z "$DATABASE_PROVIDER" ] || [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: Failed to extract database information from prisma-runner.js output:"
  echo "$DB_INFO"
  exit 1
fi

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
