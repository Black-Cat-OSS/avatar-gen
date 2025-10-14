#!/bin/bash

# E2E Tests Runner Script
# Запускает end-to-end тесты с полным стеком

set -e

echo "🎭 Запуск E2E тестов..."

# Остановка предыдущих контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only down --remove-orphans

# Запуск инфраструктуры
echo "🏗️  Запуск инфраструктуры (PostgreSQL, MinIO)..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up -d postgres-test minio

# Ожидание готовности сервисов
echo "⏳ Ожидание готовности сервисов..."
sleep 15

# Запуск приложения
echo "📦 Сборка и запуск приложения..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up -d avatar-backend-e2e avatar-frontend-e2e gateway-e2e

# Ожидание готовности приложения
echo "⏳ Ожидание готовности приложения..."
sleep 20

# Запуск E2E тестов
echo "🧪 Запуск E2E тестов..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up --abort-on-container-exit e2e-test-runner

# Получение результатов
echo "📊 Результаты E2E тестов:"
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only logs e2e-test-runner

# Очистка
echo "🧹 Очистка..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only down --remove-orphans

echo "✅ E2E тесты завершены!"
