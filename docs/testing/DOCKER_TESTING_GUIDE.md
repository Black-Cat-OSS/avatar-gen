# Docker Testing Guide

## Обзор

Этот гайд описывает как запускать тесты контейнера Avatar Generator без
изменения Dockerfile, используя монтирование конфигурационных файлов.

## Архитектура тестирования

### Принципы

- **Dockerfile не изменяется** - используется монтирование конфигураций через
  volumes
- **Гибкие конфигурации** - разные файлы для разных типов тестов
- **Изолированные окружения** - каждый тип тестов имеет свое окружение
- **Автоматизация** - готовые скрипты для запуска тестов

### Структура конфигураций

```
backend/configs/
├── settings.test.yaml          # Основная конфигурация для тестов
├── settings.test.unit.yaml     # Unit тесты (SQLite, локальное хранилище)
├── settings.test.postgres.yaml # PostgreSQL-специфичные тесты
├── settings.test.s3.yaml       # S3/MinIO-специфичные тесты
├── settings.test.e2e.yaml      # E2E тесты
└── settings.test.minio.yaml    # MinIO конфигурация

gateway/configs/
├── nginx.test.conf             # Основная nginx конфигурация для тестов
├── nginx.test.unit.conf        # Unit тесты (упрощенная)
├── nginx.test.integration.conf # Integration тесты
└── profiles/
    └── nginx.dev-frontend.conf # Frontend dev конфигурация
```

## Типы тестов

### 1. Unit тесты

- **Цель**: Тестирование отдельных модулей
- **База данных**: SQLite (in-memory)
- **Хранилище**: Локальное файловое
- **Конфигурация**: `settings.test.unit.yaml`
- **Nginx**: `nginx.test.unit.conf`

### 2. Integration тесты

- **Цель**: Тестирование интеграции компонентов
- **База данных**: PostgreSQL
- **Хранилище**: Локальное + S3/MinIO
- **Конфигурация**: `settings.test.yaml`
- **Nginx**: `nginx.test.integration.conf`

### 3. PostgreSQL-специфичные тесты

- **Цель**: Тестирование PostgreSQL функций
- **База данных**: PostgreSQL
- **Хранилище**: Локальное
- **Конфигурация**: `settings.test.postgres.yaml`

### 4. S3-специфичные тесты

- **Цель**: Тестирование S3/MinIO интеграции
- **База данных**: SQLite
- **Хранилище**: S3/MinIO
- **Конфигурация**: `settings.test.s3.yaml`

### 5. E2E тесты

- **Цель**: Тестирование полного пользовательского сценария
- **База данных**: PostgreSQL
- **Хранилище**: Локальное
- **Конфигурация**: `settings.test.e2e.yaml`
- **Nginx**: `nginx.test.conf`

## Docker Compose профили

### Основные профили

- `unit-only` - Только unit тесты
- `integration-only` - Только integration тесты
- `postgres-tests` - PostgreSQL-специфичные тесты
- `s3-tests` - S3-специфичные тесты
- `e2e-only` - Только E2E тесты

### Инфраструктурные профили

- `postgres-only` - Только PostgreSQL
- `s3-storage` - Только MinIO
- `build-only` - Только сборка образов

### Комбинированные профили

- `unit-tests` - Unit тесты + Gateway
- `integration-tests` - Integration тесты + PostgreSQL + MinIO
- `e2e-tests` - E2E тесты + полный стек

## Запуск тестов

### Через Docker Compose

```bash
# Unit тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build

# Integration тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build

# PostgreSQL тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests up --build

# S3 тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests up --build

# E2E тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up --build
```

### Через скрипты (Linux/macOS)

```bash
# Отдельные типы тестов
./scripts/test-unit.sh
./scripts/test-integration.sh
./scripts/test-postgres.sh
./scripts/test-s3.sh
./scripts/test-e2e.sh

# Все тесты
./scripts/test-all.sh
```

### Через PowerShell (Windows)

```powershell
# Отдельные типы тестов
bash scripts/test-unit.sh
bash scripts/test-integration.sh
bash scripts/test-postgres.sh
bash scripts/test-s3.sh
bash scripts/test-e2e.sh

# Все тесты
bash scripts/test-all.sh
```

## Переменные окружения

### Общие переменные

- `NODE_ENV` - Режим Node.js (test)
- `CONFIG_PATH` - Путь к конфигурационному файлу

### Тестовые переменные

- `TEST_LOG_LEVEL` - Уровень логирования (debug, info, warn, error)
- `TEST_SERVER_PORT` - Порт сервера для тестов

### База данных

- `TEST_DB_DRIVER` - Драйвер БД (sqlite, postgresql)
- `TEST_DB_HOST` - Хост БД
- `TEST_DB_PORT` - Порт БД
- `TEST_DB_NAME` - Имя БД
- `TEST_DB_USER` - Пользователь БД
- `TEST_DB_PASSWORD` - Пароль БД

### Хранилище

- `TEST_STORAGE_TYPE` - Тип хранилища (local, s3)
- `TEST_S3_ENDPOINT` - S3 endpoint
- `TEST_S3_BUCKET` - S3 bucket
- `TEST_S3_ACCESS_KEY` - S3 access key
- `TEST_S3_SECRET_KEY` - S3 secret key
- `TEST_S3_REGION` - S3 region

## Монтирование конфигураций

### Backend конфигурации

```yaml
volumes:
  - ../backend/configs/settings.test.unit.yaml:/app/backend/settings.yaml:ro
```

### Gateway конфигурации

```yaml
volumes:
  - ../gateway/configs/nginx.test.unit.conf:/etc/nginx/nginx.conf:ro
```

### Логи

```yaml
volumes:
  - ../backend/logs:/app/backend/logs
  - ../gateway/logs:/var/log/nginx
```

## Отладка

### Просмотр логов

```bash
# Логи конкретного сервиса
docker-compose -f docker/docker-compose.test-extended.yaml logs avatar-backend-unit

# Логи всех сервисов
docker-compose -f docker/docker-compose.test-extended.yaml logs
```

### Вход в контейнер

```bash
# Вход в контейнер для отладки
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit bash
```

### Проверка конфигурации

```bash
# Проверка монтированных файлов
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml
```

## Troubleshooting

### Проблемы с подключением к БД

1. Проверьте, что PostgreSQL запущен и готов
2. Убедитесь в правильности переменных окружения
3. Проверьте сетевые настройки Docker

### Проблемы с S3/MinIO

1. Убедитесь, что MinIO запущен и доступен
2. Проверьте настройки endpoint и credentials
3. Проверьте bucket policy

### Проблемы с монтированием

1. Убедитесь, что файлы конфигурации существуют
2. Проверьте права доступа к файлам
3. Убедитесь в правильности путей

## Расширение

### Добавление новых типов тестов

1. Создайте новый конфигурационный файл в `backend/configs/`
2. Добавьте новый профиль в `docker-compose.test-extended.yaml`
3. Создайте скрипт запуска в `scripts/`

### Добавление новых переменных окружения

1. Обновите конфигурационные файлы
2. Добавьте переменные в docker-compose
3. Обновите документацию

## Лучшие практики

1. **Изоляция**: Каждый тип тестов должен быть изолирован
2. **Чистота**: Всегда очищайте ресурсы после тестов
3. **Логирование**: Используйте подходящий уровень логирования
4. **Производительность**: Оптимизируйте конфигурации для быстрых тестов
5. **Безопасность**: Не используйте production credentials в тестах
