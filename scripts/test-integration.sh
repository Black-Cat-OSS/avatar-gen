#!/bin/bash

# Integration Tests Runner Script
# Запускает integration тесты с PostgreSQL и MinIO

set -e

echo "🔗 Запуск Integration тестов..."

# Остановка предыдущих контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only down --remove-orphans

# Запуск инфраструктуры
echo "🏗️  Запуск инфраструктуры (PostgreSQL, MinIO)..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up -d postgres-test minio

# Ожидание готовности сервисов
echo "⏳ Ожидание готовности сервисов..."
sleep 10

# Запуск integration тестов
echo "📦 Сборка и запуск integration тестов..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build --abort-on-container-exit avatar-backend-integration

# Получение результатов
echo "📊 Результаты integration тестов:"
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only logs avatar-backend-integration

# Очистка
echo "🧹 Очистка..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only down --remove-orphans

echo "✅ Integration тесты завершены!"
