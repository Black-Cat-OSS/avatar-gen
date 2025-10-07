# Руководство по тестированию с Docker Compose

## Обзор

Система тестирования поддерживает матричное тестирование с различными
комбинациями:

- **Storage**: Local, S3 (MinIO)
- **Database**: SQLite, PostgreSQL
- **Test Types**: Unit, Integration, E2E

## Файлы конфигурации

### Docker Compose файлы

- `docker-compose.test.yaml` - Основной файл для тестирования с профилями
- `docker-compose.test-postgres.yaml` - Временный PostgreSQL контейнер

### Настройки

- `backend/settings.test.yaml` - Основная тестовая конфигурация
- `backend/settings.test.minio.yaml` - Конфигурация для MinIO

## Профили тестирования

### 1. Unit тесты

```bash
# SQLite + Local Storage
docker-compose -f docker/docker-compose.test.yaml --profile unit-tests up --build
```

### 2. Integration тесты

```bash
# PostgreSQL + MinIO
docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up --build
```

### 3. E2E тесты

```bash
# Полный стек: PostgreSQL + MinIO + Frontend + Gateway
docker-compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build
```

## Скрипты для тестирования

### 1. Матричное тестирование

```bash
# Linux/macOS
./scripts/test-matrix.sh [КОМАНДА]

# Windows PowerShell
bash scripts/test-matrix.sh [КОМАНДА]
```

**Команды:**

- `unit` - Unit тесты (SQLite + Local)
- `integration` - Integration тесты (PostgreSQL + MinIO)
- `e2e` - E2E тесты (полный стек)
- `all` - Все тесты последовательно
- `matrix --storage s3 --database postgresql` - Матричный тест
- `cleanup` - Очистка контейнеров

### 2. Управление временным PostgreSQL

```bash
# Linux/macOS
./scripts/test-postgres.sh [КОМАНДА]

# Windows PowerShell
bash scripts/test-postgres.sh [КОМАНДА]
```

**Команды:**

- `start` - Запуск временного PostgreSQL
- `stop` - Остановка и удаление
- `restart` - Перезапуск
- `status` - Статус контейнера
- `connect` - Подключение к PostgreSQL
- `exec "SQL_COMMAND"` - Выполнение SQL
- `reset` - Сброс базы данных
- `logs` - Показать логи

### 3. Тесты с временным PostgreSQL

```bash
# Linux/macOS
./scripts/test-with-postgres.sh [КОМАНДА]

# Windows PowerShell
bash scripts/test-with-postgres.sh [КОМАНДА]
```

**Команды:**

- `integration-postgres` - Integration тесты с PostgreSQL
- `e2e-postgres` - E2E тесты с PostgreSQL
- `integration-minio` - Integration тесты с MinIO
- `e2e-minio` - E2E тесты с MinIO
- `integration-full` - Integration тесты с PostgreSQL + MinIO
- `e2e-full` - E2E тесты с PostgreSQL + MinIO
- `cleanup` - Очистка контейнеров

## Переменные окружения

### Для PostgreSQL

```bash
export TEST_DB_DRIVER=postgresql
export TEST_DB_HOST=localhost
export TEST_DB_PORT=5433
export TEST_DB_NAME=avatar_gen_test
export TEST_DB_USER=test_user
export TEST_DB_PASSWORD=test_password
```

### Для MinIO

```bash
export TEST_STORAGE_TYPE=s3
export TEST_S3_ENDPOINT=http://localhost:9000
export TEST_S3_ACCESS_KEY=test-access-key
export TEST_S3_SECRET_KEY=test-secret-key
export TEST_S3_BUCKET=avatar-gen-test
export TEST_S3_REGION=us-east-1
```

## Примеры использования

### Быстрый запуск unit тестов

```bash
bash scripts/test-matrix.sh unit
```

### Запуск integration тестов с PostgreSQL

```bash
bash scripts/test-with-postgres.sh integration-postgres
```

### Запуск E2E тестов с полным стеком

```bash
bash scripts/test-with-postgres.sh e2e-full
```

### Матричное тестирование

```bash
# Тест с S3 + PostgreSQL
bash scripts/test-matrix.sh matrix --storage s3 --database postgresql

# Тест с Local + SQLite
bash scripts/test-matrix.sh matrix --storage local --database sqlite
```

### Управление временным PostgreSQL

```bash
# Запуск PostgreSQL
bash scripts/test-postgres.sh start

# Проверка статуса
bash scripts/test-postgres.sh status

# Подключение к базе
bash scripts/test-postgres.sh connect

# Выполнение SQL
bash scripts/test-postgres.sh exec "SELECT version();"

# Остановка
bash scripts/test-postgres.sh stop
```

## Очистка

### Очистка всех тестовых контейнеров

```bash
# Через скрипты
bash scripts/test-matrix.sh cleanup
bash scripts/test-with-postgres.sh cleanup
bash scripts/test-postgres.sh stop

# Или напрямую через docker-compose
docker-compose -f docker/docker-compose.test.yaml down --volumes --remove-orphans
docker-compose -f docker/docker-compose.test-postgres.yaml down --volumes --remove-orphans
```

### Очистка volumes

```bash
docker volume prune -f
```

## Порты

- **PostgreSQL**: 5433 (внешний) → 5432 (внутренний)
- **MinIO API**: 9000
- **MinIO Console**: 9001
- **Backend**: 3000 (внутренний)
- **Frontend**: 8080 (внутренний)
- **Gateway**: 12746 (внешний) → 12745 (внутренний)

## Troubleshooting

### PostgreSQL не запускается

```bash
# Проверить логи
bash scripts/test-postgres.sh logs

# Перезапустить
bash scripts/test-postgres.sh restart
```

### MinIO недоступен

```bash
# Проверить статус контейнера
docker-compose -f docker/docker-compose.test.yaml ps minio

# Проверить логи
docker-compose -f docker/docker-compose.test.yaml logs minio
```

### Очистка при проблемах

```bash
# Полная очистка
docker system prune -a -f
docker volume prune -f
```
