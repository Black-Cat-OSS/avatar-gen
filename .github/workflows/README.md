# GitHub Actions Workflows

## Обзор

Система CI/CD состоит из трех основных workflows:

1. **develop.yml** - Быстрые тесты для PR в develop
2. **deploy-prod.yml** - Полное тестирование и деплой в production
3. **matrix-tests.yml** - Расширенное матричное тестирование

## Workflows

### 1. develop.yml (CI для develop)

**Триггеры:**
- PR в ветку `develop`
- Ручной запуск

**Тесты:**
- ✅ Lint Backend
- ✅ Lint Frontend  
- ✅ Unit Tests (SQLite + Local)
- ✅ Integration Tests (PostgreSQL + MinIO)
- ✅ E2E Tests (Full Stack)
- ✅ Docker Build Test

**Время выполнения:** ~5-10 минут

### 2. deploy-prod.yml (Production Deploy)

**Триггеры:**
- Push в ветку `main`
- Ручной запуск

**Тесты:**
- ✅ Matrix Tests (все комбинации database + storage)
- ✅ Build Frontend
- ✅ Deploy to Production

**Время выполнения:** ~15-20 минут

### 3. matrix-tests.yml (Расширенное тестирование)

**Триггеры:**
- Ручной запуск с выбором типа тестов
- Создание тега (v*)
- PR в main

**Типы тестов:**
- **Unit Tests** - SQLite + Local Storage
- **Integration Tests** - Все комбинации database + storage
- **E2E Tests** - PostgreSQL + S3 (Full Stack)
- **Custom Matrix** - Настраиваемые комбинации

**Время выполнения:** ~20-30 минут

## Матричное тестирование

### Поддерживаемые комбинации:

| Database | Storage | Unit | Integration | E2E |
|----------|---------|------|-------------|-----|
| SQLite   | Local   | ✅   | ✅          | ❌  |
| SQLite   | S3      | ❌   | ✅          | ❌  |
| PostgreSQL | Local | ❌   | ✅          | ❌  |
| PostgreSQL | S3    | ❌   | ✅          | ✅  |

### Переменные окружения для тестов:

```bash
# Storage
TEST_STORAGE_TYPE=local|s3
TEST_S3_ENDPOINT=http://localhost:9000
TEST_S3_ACCESS_KEY=test-access-key
TEST_S3_SECRET_KEY=test-secret-key
TEST_S3_BUCKET=avatar-gen-test
TEST_S3_REGION=us-east-1

# Database
TEST_DB_DRIVER=sqlite|postgresql
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_NAME=avatar_gen_test
TEST_DB_USER=test_user
TEST_DB_PASSWORD=test_password
```

## Docker Compose профили

### develop.yml использует:
- `unit-tests` - Unit тесты
- `integration-tests` - Integration тесты
- `e2e-tests` - E2E тесты

### deploy-prod.yml использует:
- `matrix-tests` - Матричное тестирование

### matrix-tests.yml использует:
- `unit-tests` - Unit тесты
- `integration-tests` - Integration тесты
- `e2e-tests` - E2E тесты
- `matrix-tests` - Кастомное матричное тестирование

## Секреты

### Для тестирования:
- `TEST_S3_ENDPOINT` - Endpoint для тестового S3
- `TEST_S3_BUCKET` - Бакет для тестов
- `TEST_S3_ACCESS_KEY` - Access key для тестов
- `TEST_S3_SECRET_KEY` - Secret key для тестов
- `TEST_S3_REGION` - Регион для тестов

### Для production:
- `PROD_S3_ENDPOINT` - Production S3 endpoint
- `PROD_S3_BUCKET` - Production S3 bucket
- `PROD_S3_ACCESS_KEY` - Production S3 access key
- `PROD_S3_SECRET_KEY` - Production S3 secret key
- `PROD_S3_REGION` - Production S3 region
- `PROD_DB_HOST` - Production database host
- `PROD_DB_PORT` - Production database port
- `PROD_DB_NAME` - Production database name
- `PROD_DB_USERNAME` - Production database username
- `PROD_DB_PASSWORD` - Production database password

### Для деплоя:
- `SSH_HOST` - Production server host
- `SSH_PORT` - SSH port
- `SSH_USERNAME` - SSH username
- `SSH_PRIVATE_KEY` - SSH private key
- `APP_PATH` - Application path on server

## Локальное тестирование

### Запуск тестов локально:

```bash
# Unit тесты
bash scripts/test-matrix.sh unit

# Integration тесты с PostgreSQL
bash scripts/test-with-postgres.sh integration-postgres

# E2E тесты с полным стеком
bash scripts/test-with-postgres.sh e2e-full

# Матричное тестирование
bash scripts/test-matrix.sh matrix --storage s3 --database postgresql
```

### Управление временным PostgreSQL:

```bash
# Запуск PostgreSQL
bash scripts/test-postgres.sh start

# Проверка статуса
bash scripts/test-postgres.sh status

# Остановка
bash scripts/test-postgres.sh stop
```

## Troubleshooting

### Частые проблемы:

1. **PostgreSQL не запускается**
   - Проверить логи: `bash scripts/test-postgres.sh logs`
   - Перезапустить: `bash scripts/test-postgres.sh restart`

2. **MinIO недоступен**
   - Проверить статус: `docker-compose -f docker/docker-compose.test.yaml ps minio`
   - Проверить логи: `docker-compose -f docker/docker-compose.test.yaml logs minio`

3. **Тесты падают в CI**
   - Проверить переменные окружения
   - Проверить доступность сервисов
   - Проверить логи контейнеров

### Очистка:

```bash
# Очистка всех тестовых контейнеров
docker-compose -f docker/docker-compose.test.yaml down --volumes --remove-orphans
docker-compose -f docker/docker-compose.test-postgres.yaml down --volumes --remove-orphans

# Полная очистка Docker
docker system prune -a -f
docker volume prune -f
```

## Мониторинг

### Coverage Reports:
- Автоматически загружаются в Codecov
- Доступны в каждом job'е
- Группируются по типам тестов

### Test Summary:
- Автоматически генерируется в matrix-tests.yml
- Показывает статус всех типов тестов
- Доступен в GitHub Actions UI
