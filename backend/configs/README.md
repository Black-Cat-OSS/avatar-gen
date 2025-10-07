# Backend Configuration Files

## Обзор

Эта директория содержит конфигурационные файлы для различных сред выполнения приложения.

## Файлы конфигурации

### settings.test.yaml
Основной файл конфигурации для тестирования. Поддерживает:
- Переменные окружения для гибкой настройки
- SQLite и PostgreSQL базы данных
- Local и S3 хранилища
- Настраиваемые порты и логирование

### settings.test.minio.yaml
Специализированная конфигурация для тестирования с MinIO:
- Преднастроена для MinIO S3-совместимого хранилища
- PostgreSQL база данных
- Оптимизирована для быстрых тестов

## Переменные окружения

### Storage
- TEST_STORAGE_TYPE - Тип хранилища (local, s3)
- TEST_S3_ENDPOINT - S3 endpoint URL
- TEST_S3_BUCKET - S3 bucket name
- TEST_S3_ACCESS_KEY - S3 access key
- TEST_S3_SECRET_KEY - S3 secret key
- TEST_S3_REGION - S3 region

### Database
- TEST_DB_DRIVER - Тип базы данных (sqlite, postgresql)
- TEST_DB_HOST - Database host
- TEST_DB_PORT - Database port
- TEST_DB_NAME - Database name
- TEST_DB_USER - Database username
- TEST_DB_PASSWORD - Database password

### Server
- TEST_SERVER_PORT - Server port
- TEST_LOG_LEVEL - Log level (debug, info, warn, error)

## Интеграция с Docker Compose

Файлы конфигурации монтируются в контейнеры через docker-compose:

```yaml
volumes:
  - ../backend/configs/settings.test.yaml:/app/settings.yaml:ro
```

## Примеры использования

### Локальное тестирование
```bash
# Unit тесты
export TEST_DB_DRIVER=sqlite
export TEST_STORAGE_TYPE=local
npm run test:unit

# Integration тесты с PostgreSQL
export TEST_DB_DRIVER=postgresql
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5433
npm run test:integration
```

### Docker Compose тестирование
```bash
# Unit тесты
docker-compose -f docker/docker-compose.test.yaml --profile unit-tests up

# Integration тесты
docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up

# E2E тесты
docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up
```

## Примечания

- Все файлы конфигурации поддерживают переменные окружения
- Значения по умолчанию оптимизированы для тестирования
- Конфигурации совместимы с Docker Compose профилями
- Файлы монтируются в режиме только для чтения (ro)
