#!/bin/bash

# Скрипт для генерации тестовой конфигурации
# Использование: ./scripts/generate-test-config.sh [database] [storage] [s3-endpoint] [s3-bucket]

set -e

# Параметры по умолчанию
DATABASE=${1:-sqlite}
STORAGE=${2:-local}
S3_ENDPOINT=${3:-https://test-s3-endpoint.com}
S3_BUCKET=${4:-avatar-gen-test}

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Генерация тестовой конфигурации${NC}"
echo "Database: $DATABASE"
echo "Storage: $STORAGE"
echo "S3 Endpoint: $S3_ENDPOINT"
echo "S3 Bucket: $S3_BUCKET"
echo

# Проверяем, что мы в корне проекта
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Запустите скрипт из корня проекта${NC}"
    exit 1
fi

# Переходим в директорию backend
cd backend

# Проверяем наличие файла настроек
if [ ! -f "settings.yaml" ]; then
    echo -e "${RED}❌ Файл settings.yaml не найден${NC}"
    exit 1
fi

# Генерируем конфигурацию
echo -e "${YELLOW}📝 Создание settings.test.matrix.yaml...${NC}"

cat > settings.test.matrix.yaml << EOF
app:
  storage:
    type: '$STORAGE'
    local:
      save_path: './storage/test-avatars'
    s3:
      endpoint: '$S3_ENDPOINT'
      bucket: '$S3_BUCKET'
      access_key: '\${TEST_S3_ACCESS_KEY:-test-access-key}'
      secret_key: '\${TEST_S3_SECRET_KEY:-test-secret-key}'
      region: '\${TEST_S3_REGION:-us-east-1}'
      force_path_style: true
      connection:
        maxRetries: 1
        retryDelay: 100
  server:
    port: 3002
  database:
    driver: '$DATABASE'
    connection:
      maxRetries: 3
      retryDelay: 1000
    sqlite_params:
      url: 'file:./storage/test-database/database.test.sqlite'
    network:
      host: 'localhost'
      port: 5432
      database: 'avatar_gen_test'
      username: 'postgres'
      password: 'password'
      ssl: false
  logging:
    level: 'error'
    verbose: false
    pretty: false
EOF

echo -e "${GREEN}✅ Конфигурация создана: settings.test.matrix.yaml${NC}"

# Создаем директории для тестов
echo -e "${YELLOW}📁 Создание тестовых директорий...${NC}"
mkdir -p storage/test-avatars
mkdir -p storage/test-database

echo -e "${GREEN}✅ Директории созданы${NC}"

# Показываем содержимое конфигурации
echo
echo -e "${YELLOW}📋 Содержимое конфигурации:${NC}"
echo "----------------------------------------"
cat settings.test.matrix.yaml
echo "----------------------------------------"

echo
echo -e "${GREEN}🚀 Готово! Теперь можно запускать тесты:${NC}"
echo "  NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test"
echo
echo -e "${YELLOW}💡 Для использования реальных S3 credentials:${NC}"
echo "  export TEST_S3_ACCESS_KEY=your-access-key"
echo "  export TEST_S3_SECRET_KEY=your-secret-key"
echo "  export TEST_S3_REGION=your-region"
echo "  NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test"
