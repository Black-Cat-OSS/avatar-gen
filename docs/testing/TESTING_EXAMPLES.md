# Примеры тестирования контейнера

## Быстрый старт

### 1. Unit тесты (самые быстрые)

```bash
# Через Docker Compose
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build

# Через скрипт (Linux/macOS)
./scripts/test-unit.sh

# Через скрипт (Windows)
bash scripts/test-unit.sh
```

### 2. Integration тесты

```bash
# Через Docker Compose
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build

# Через скрипт
bash scripts/test-integration.sh
```

### 3. Все тесты

```bash
# Через скрипт (рекомендуется)
bash scripts/test-all.sh
```

## Детальные примеры

### Тестирование с различными базами данных

#### SQLite (unit тесты)

```bash
# Конфигурация: settings.test.unit.yaml
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build
```

#### PostgreSQL (integration тесты)

```bash
# Конфигурация: settings.test.postgres.yaml
docker-compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests up --build
```

### Тестирование с различными хранилищами

#### Локальное хранилище

```bash
# Конфигурация: settings.test.yaml с TEST_STORAGE_TYPE=local
export TEST_STORAGE_TYPE=local
docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build
```

#### S3/MinIO хранилище

```bash
# Конфигурация: settings.test.s3.yaml
docker-compose -f docker/docker-compose.test-extended.yaml --profile s3-tests up --build
```

### E2E тестирование

```bash
# Полный стек с gateway
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up --build

# Только health check тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile e2e-health up --build
```

## Отладка и мониторинг

### Просмотр логов в реальном времени

```bash
# Логи всех сервисов
docker-compose -f docker/docker-compose.test-extended.yaml logs -f

# Логи конкретного сервиса
docker-compose -f docker/docker-compose.test-extended.yaml logs -f avatar-backend-unit
```

### Вход в контейнер для отладки

```bash
# Вход в backend контейнер
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit bash

# Проверка конфигурации
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml

# Проверка переменных окружения
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit env | grep TEST_
```

### Проверка состояния сервисов

```bash
# Статус контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml ps

# Health check статус
docker-compose -f docker/docker-compose.test-extended.yaml ps --format "table {{.Name}}\t{{.Status}}"
```

## Кастомные конфигурации

### Создание собственного конфигурационного файла

```bash
# 1. Создайте новый файл конфигурации
cp backend/settings.test.yaml backend/settings.test.custom.yaml

# 2. Отредактируйте файл под ваши нужды
# Например, измените порт или уровень логирования

# 3. Создайте новый сервис в docker-compose или используйте существующий
# с монтированием вашего файла:
volumes:
  - ../backend/settings.test.custom.yaml:/app/backend/settings.yaml:ro
```

### Переопределение переменных окружения

```bash
# Установка переменных перед запуском
export TEST_LOG_LEVEL=debug
export TEST_SERVER_PORT=3001
export TEST_DB_DRIVER=postgresql

# Запуск с переменными
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build
```

## Производительность

### Оптимизация для быстрых тестов

```bash
# Unit тесты с минимальным логированием
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build

# Использование in-memory SQLite
# Конфигурация: settings.test.unit.yaml
```

### Тестирование под нагрузкой

```bash
# Performance тесты (если профиль существует)
docker-compose -f docker/docker-compose.test-extended.yaml --profile performance-tests up --build
```

## CI/CD интеграция

### GitHub Actions пример

```yaml
name: Test Container
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Unit Tests
        run: |
          docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build --abort-on-container-exit

      - name: Run Integration Tests
        run: |
          docker-compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build --abort-on-container-exit
```

### GitLab CI пример

```yaml
test:unit:
  stage: test
  script:
    - docker-compose -f docker/docker-compose.test-extended.yaml --profile
      unit-only up --build --abort-on-container-exit

test:integration:
  stage: test
  script:
    - docker-compose -f docker/docker-compose.test-extended.yaml --profile
      integration-only up --build --abort-on-container-exit
```

## Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверьте логи сборки
docker-compose -f docker/docker-compose.test-extended.yaml build --no-cache

# Проверьте конфигурацию
docker-compose -f docker/docker-compose.test-extended.yaml config
```

### Проблема: Тесты падают

```bash
# Проверьте логи тестов
docker-compose -f docker/docker-compose.test-extended.yaml logs avatar-backend-unit

# Запустите тесты с verbose выводом
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit npm run test:unit --verbose
```

### Проблема: Нет доступа к файлам конфигурации

```bash
# Проверьте монтирование
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit ls -la /app/backend/

# Проверьте содержимое файла
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml
```

## Лучшие практики

### 1. Используйте профили для изоляции

```bash
# Хорошо: изолированные тесты
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only up

# Плохо: запуск всех сервисов
docker-compose -f docker/docker-compose.test-extended.yaml up
```

### 2. Очищайте ресурсы после тестов

```bash
# Автоматическая очистка
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only down --remove-orphans

# Очистка volumes
docker-compose -f docker/docker-compose.test-extended.yaml --profile unit-only down -v
```

### 3. Используйте подходящие уровни логирования

```bash
# Unit тесты: минимальное логирование
export TEST_LOG_LEVEL=error

# Integration тесты: подробное логирование
export TEST_LOG_LEVEL=debug
```

### 4. Мониторьте ресурсы

```bash
# Проверка использования ресурсов
docker stats

# Очистка неиспользуемых ресурсов
docker system prune -f
```
