#!/bin/sh
set -e

echo "=== Avatar Generator Backend Startup ==="

# Проверяем конфигурацию базы данных
echo "🔍 Checking database configuration..."

# TypeORM автоматически синхронизирует схему базы данных
# Нет необходимости в дополнительных командах миграции

# Запускаем приложение
echo "🚀 Starting avatar generator application..."
exec node dist/main.js