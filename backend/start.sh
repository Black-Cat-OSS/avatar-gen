#!/bin/sh
set -e

echo "=== Avatar Generator Backend Startup ==="

# Определяем DATABASE_PROVIDER из конфигурации
CONFIG_FILE="./settings.yaml"
if [ -f "$CONFIG_FILE" ]; then
  # Читаем driver из YAML конфигурации
  DATABASE_PROVIDER=$(grep -A 20 "database:" "$CONFIG_FILE" | grep "driver:" | awk '{print $2}' | tr -d "'\"")
  echo "📋 Database provider from config: $DATABASE_PROVIDER"
else
  # Fallback: определяем по переменной окружения
  if [ -z "$DATABASE_PROVIDER" ]; then
    case "$DATABASE_URL" in
      postgresql://*|postgres://*)
        DATABASE_PROVIDER="postgresql"
        ;;
      file:*)
        DATABASE_PROVIDER="sqlite"
        ;;
      *)
        echo "⚠️  Warning: Cannot determine database provider from DATABASE_URL: $DATABASE_URL"
        echo "Defaulting to sqlite"
        DATABASE_PROVIDER="sqlite"
        ;;
    esac
  fi
fi

echo "📦 Database Provider: $DATABASE_PROVIDER"
echo "🔗 Database URL: ${DATABASE_URL:0:30}..." # Показываем только начало URL (безопасность)

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
