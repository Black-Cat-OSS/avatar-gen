#!/bin/bash

# PostgreSQL-specific Tests Runner Script
# Запускает тесты специфичные для PostgreSQL

set -e

echo "🐘 Запуск PostgreSQL-специфичных тестов..."

# Остановка предыдущих контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests down --remove-orphans

# Запуск PostgreSQL
echo "🏗️  Запуск PostgreSQL..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests up -d postgres-test

# Ожидание готовности PostgreSQL
echo "⏳ Ожидание готовности PostgreSQL..."
sleep 10

# Запуск тестов
echo "📦 Сборка и запуск PostgreSQL тестов..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests up --build --abort-on-container-exit avatar-backend-postgres

# Получение результатов
echo "📊 Результаты PostgreSQL тестов:"
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests logs avatar-backend-postgres

# Очистка
echo "🧹 Очистка..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests down --remove-orphans

echo "✅ PostgreSQL тесты завершены!"