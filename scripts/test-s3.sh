#!/bin/bash

# S3-specific Tests Runner Script
# Запускает тесты специфичные для S3/MinIO

set -e

echo "☁️  Запуск S3-специфичных тестов..."

# Остановка предыдущих контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests down --remove-orphans

# Запуск MinIO
echo "🏗️  Запуск MinIO..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests up -d minio

# Ожидание готовности MinIO
echo "⏳ Ожидание готовности MinIO..."
sleep 10

# Запуск тестов
echo "📦 Сборка и запуск S3 тестов..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests up --build --abort-on-container-exit avatar-backend-s3

# Получение результатов
echo "📊 Результаты S3 тестов:"
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests logs avatar-backend-s3

# Очистка
echo "🧹 Очистка..."
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests down --remove-orphans

echo "✅ S3 тесты завершены!"
