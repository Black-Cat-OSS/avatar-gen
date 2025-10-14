# GitHub Actions Workflows

## Обзор

Система CI/CD состоит из восьми основных workflows с использованием новой
системы тестирования контейнера:

### Основные Workflows

1. **develop.yml** - Быстрые тесты для PR в develop
2. **deploy-prod.yml** - Полное тестирование и деплой в production
3. **matrix-tests.yml** - Расширенное матричное тестирование

### Специализированные Workflows ⭐ НОВЫЕ

4. **test-unit.yml** - Unit тесты
5. **test-integration.yml** - Integration тесты
6. **test-e2e.yml** - E2E тесты
7. **test-specialized.yml** - PostgreSQL, S3, Performance тесты
8. **test-all.yml** - Комплексное тестирование

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

**Время выполнения:** ~5-10 минут **Конфигурация:**
`docker-compose.test-extended.yaml`

### 2. deploy-prod.yml (Production Deploy)

**Триггеры:**

- Push в ветку `main`
- Ручной запуск

**Тесты:**

- ✅ Matrix Tests (все комбинации database + storage)
- ✅ Build Frontend
- ✅ Deploy to Production

**Время выполнения:** ~15-20 минут **Конфигурация:**
`docker-compose.test-extended.yaml`

### 3. matrix-tests.yml (Расширенное тестирование)

**Триггеры:**

- Ручной запуск с выбором типа тестов
- Создание тега (v\*)
- PR в main

**Типы тестов:**

- **Unit Tests** - SQLite + Local Storage
- **Integration Tests** - Все комбинации database + storage
- **E2E Tests** - PostgreSQL + S3 (Full Stack)
- **Custom Matrix** - Настраиваемые комбинации

**Время выполнения:** ~20-30 минут **Конфигурация:**
`docker-compose.test-extended.yaml`

### 4. test-unit.yml ⭐ НОВЫЙ

**Триггеры:**

- Изменения unit тестов
- PR в develop
- Ручной запуск

**Тесты:**

- ✅ Unit Tests (SQLite in-memory + Local Storage)
- ✅ Быстрое выполнение (~30 секунд)
- ✅ Минимальное логирование

**Конфигурация:** `settings.test.unit.yaml`

### 5. test-integration.yml ⭐ НОВЫЙ

**Триггеры:**

- Изменения integration тестов
- PR в develop
- Ручной запуск

**Тесты:**

- ✅ Integration Tests (PostgreSQL + MinIO)
- ✅ Гибкие параметры БД и хранилища
- ✅ Подробное логирование

**Конфигурация:** `settings.test.yaml`

### 6. test-e2e.yml ⭐ НОВЫЙ

**Триггеры:**

- Изменения E2E тестов
- PR в main
- Ручной запуск

**Тесты:**

- ✅ E2E Tests (Full Stack: Backend + Frontend + Gateway)
- ✅ Health check тесты
- ✅ API тесты

**Конфигурация:** `settings.test.e2e.yaml`

### 7. test-specialized.yml ⭐ НОВЫЙ

**Триггеры:**

- Изменения специализированных конфигураций
- Ручной запуск

**Тесты:**

- ✅ PostgreSQL Specialized Tests
- ✅ S3/MinIO Specialized Tests
- ✅ Performance Tests
- ✅ Custom Matrix Tests

**Конфигурации:** `settings.test.postgres.yaml`, `settings.test.s3.yaml`

### 8. test-all.yml ⭐ НОВЫЙ

**Триггеры:**

- Создание тегов
- PR в main
- Ручной запуск

**Тесты:**

- ✅ Unit Tests
- ✅ Integration Tests
- ✅ E2E Tests
- ✅ PostgreSQL Specialized
- ✅ S3 Specialized
- ✅ Комплексная отчетность

**Время выполнения:** ~10-15 минут (параллельно)

## Новая архитектура тестирования

### Принципы

- ✅ **Dockerfile не изменяется** - все настройки через монтирование
- ✅ **Гибкие конфигурации** - разные файлы для разных сценариев
- ✅ **Изолированные окружения** - каждый тип тестов в своем профиле
- ✅ **Автоматизация** - готовые workflow для всех сценариев

### Конфигурационные файлы

```
backend/configs/
├── settings.test.unit.yaml     # Unit тесты (SQLite, локальное)
├── settings.test.yaml          # Основная конфигурация
├── settings.test.postgres.yaml # PostgreSQL-специфичные
├── settings.test.s3.yaml       # S3/MinIO-специфичные
└── settings.test.e2e.yaml      # E2E тесты

gateway/configs/
├── nginx.test.unit.conf        # Unit тесты
├── nginx.test.integration.conf # Integration тесты
└── nginx.test.conf             # E2E тесты
```

### Docker Compose профили

- `unit-only` - Unit тесты
- `integration-only` - Integration тесты
- `postgres-tests` - PostgreSQL-специфичные
- `s3-tests` - S3-специфичные
- `e2e-only` - E2E тесты
- `performance-tests` - Performance тесты
- `matrix-tests` - Матричные тесты

## Матричное тестирование

### Поддерживаемые комбинации:

| Database   | Storage | Unit | Integration | E2E | Specialized |
| ---------- | ------- | ---- | ----------- | --- | ----------- |
| SQLite     | Local   | ✅   | ✅          | ❌  | ❌          |
| SQLite     | S3      | ❌   | ✅          | ❌  | ✅          |
| PostgreSQL | Local   | ❌   | ✅          | ❌  | ✅          |
| PostgreSQL | S3      | ❌   | ✅          | ✅  | ✅          |

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

# Server & Logging
TEST_SERVER_PORT=3000|3002
TEST_LOG_LEVEL=debug|info|warn|error
```

## Локальное тестирование

### Запуск тестов локально (новые скрипты):

```bash
# Все тесты одной командой
bash scripts/test-all.sh

# Отдельные типы тестов
bash scripts/test-unit.sh         # Unit тесты (~30с)
bash scripts/test-integration.sh  # Integration тесты (~2м)
bash scripts/test-postgres.sh     # PostgreSQL тесты (~1м)
bash scripts/test-s3.sh           # S3 тесты (~1м)
bash scripts/test-e2e.sh          # E2E тесты (~5м)

# Старые скрипты (совместимость)
bash scripts/test-matrix.sh unit
bash scripts/test-with-postgres.sh integration-postgres
bash scripts/test-with-postgres.sh e2e-full
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

## Troubleshooting

### Частые проблемы:

1. **PostgreSQL не запускается**
   - Проверить логи: `bash scripts/test-postgres.sh logs`
   - Перезапустить: `bash scripts/test-postgres.sh restart`

2. **MinIO недоступен**
   - Проверить статус:
     `docker-compose -f docker/docker-compose.test-extended.yaml ps minio`
   - Проверить логи:
     `docker-compose -f docker/docker-compose.test-extended.yaml logs minio`

3. **Тесты падают в CI**
   - Проверить переменные окружения
   - Проверить доступность сервисов
   - Проверить логи контейнеров

4. **Проблемы с монтированием конфигураций**
   - Проверить, что файлы конфигурации существуют
   - Убедиться в правильности путей в docker-compose
   - Проверить права доступа к файлам

### Очистка:

```bash
# Очистка всех тестовых контейнеров (новые)
docker-compose -f docker/docker-compose.test-extended.yaml down --volumes --remove-orphans

# Очистка старых контейнеров (совместимость)
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
- Отдельные флаги для каждого типа тестов

### Test Summary:

- Автоматически генерируется во всех workflow
- Показывает статус всех типов тестов
- Доступен в GitHub Actions UI
- Детальная отчетность в test-all.yml

### Артефакты:

- Результаты тестов сохраняются на 3-7 дней
- Логи доступны для скачивания
- Возможность отладки через артефакты

## Миграция с старых workflow

### Что изменилось:

1. **Новые конфигурационные файлы** - специализированные настройки для каждого
   типа тестов
2. **Расширенный docker-compose** - `docker-compose.test-extended.yaml` с новыми
   профилями
3. **Специализированные workflow** - отдельные файлы для каждого типа тестов
4. **Новые скрипты** - упрощенные команды для локального тестирования

### Совместимость:

- Старые workflow продолжают работать
- Старые скрипты сохранены для совместимости
- Постепенная миграция на новые workflow
