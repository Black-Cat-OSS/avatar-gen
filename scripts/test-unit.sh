#!/bin/bash

# Unit Tests Runner Script
# Запускает unit тесты с монтированием конфигурации

set -e

echo "🧪 Запуск Unit тестов..."

# Остановка предыдущих контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only down --remove-orphans

# Запуск unit тестов
echo "📦 Сборка и запуск unit тестов..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build --abort-on-container-exit

# Получение результатов
echo "📊 Результаты unit тестов:"
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only logs avatar-backend-unit

# Очистка
echo "🧹 Очистка..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only down --remove-orphans

echo "✅ Unit тесты завершены!"
