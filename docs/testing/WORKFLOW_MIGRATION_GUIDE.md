# Workflow Migration Guide

## Обзор

Этот гайд описывает миграцию GitHub Actions workflow для использования новой
системы тестирования контейнера с монтированием конфигурационных файлов.

## Что изменилось

### ✅ Новые возможности

1. **Специализированные workflow файлы**
   - `test-unit.yml` - Unit тесты
   - `test-integration.yml` - Integration тесты
   - `test-e2e.yml` - E2E тесты
   - `test-specialized.yml` - PostgreSQL, S3, Performance тесты
   - `test-all.yml` - Комплексное тестирование

2. **Расширенная система конфигураций**
   - Специализированные файлы для каждого типа тестов
   - Монтирование через volumes в docker-compose
   - Гибкие переменные окружения

3. **Новые Docker Compose профили**
   - `unit-only`, `integration-only`, `e2e-only`
   - `postgres-tests`, `s3-tests`, `performance-tests`
   - Изолированные окружения для каждого типа тестов

4. **Улучшенная отчетность**
   - Детальные summary в каждом workflow
   - Отдельные артефакты для каждого типа тестов
   - Расширенная статистика выполнения

### 🔄 Обновленные файлы

1. **matrix-tests.yml** - Обновлен для использования
   `docker-compose.test-extended.yaml`
2. **develop.yml** - Обновлен для использования новых профилей
3. **deploy-prod.yml** - Обновлен для использования расширенной системы
   тестирования
4. **README.md** - Полностью переписан с описанием новых возможностей

## Миграция по типам тестов

### Unit Tests

**Было:**

```yaml
# В matrix-tests.yml
unit-tests:
  steps:
    - name: Run unit tests
      run: pnpm run test:unit
      env:
        NODE_ENV: test
        TEST_STORAGE_TYPE: local
        TEST_DB_DRIVER: sqlite
```

**Стало:**

```yaml
# В test-unit.yml
unit-tests:
  steps:
    - name: Run unit tests with Docker Compose
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile unit-only up --build --abort-on-container-exit avatar-backend-unit
```

**Конфигурация:** `settings.test.unit.yaml` **Профиль:** `unit-only`

### Integration Tests

**Было:**

```yaml
# В matrix-tests.yml
integration-tests:
  steps:
    - name: Run integration tests with Docker Compose
      run: |
        docker compose -f docker/docker-compose.test.yaml --profile integration-tests up --build --abort-on-container-exit avatar-backend-integration
```

**Стало:**

```yaml
# В test-integration.yml
integration-tests:
  steps:
    - name: Run integration tests with Docker Compose
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile integration-only up --build --abort-on-container-exit avatar-backend-integration
```

**Конфигурация:** `settings.test.yaml` **Профиль:** `integration-only`

### E2E Tests

**Было:**

```yaml
# В matrix-tests.yml
e2e-tests:
  steps:
    - name: Run E2E tests with Docker Compose
      run: |
        docker compose -f docker/docker-compose.test.yaml --profile e2e-tests up --build --abort-on-container-exit gateway-e2e
```

**Стало:**

```yaml
# В test-e2e.yml
e2e-tests:
  steps:
    - name: Run E2E tests with Docker Compose
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile e2e-only up --build --abort-on-container-exit e2e-test-runner
```

**Конфигурация:** `settings.test.e2e.yaml` **Профиль:** `e2e-only`

## Новые типы тестов

### PostgreSQL Specialized Tests

```yaml
# В test-specialized.yml
postgres-tests:
  steps:
    - name: Run PostgreSQL specialized tests
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile postgres-tests up --build --abort-on-container-exit avatar-backend-postgres
```

**Конфигурация:** `settings.test.postgres.yaml` **Профиль:** `postgres-tests`

### S3 Specialized Tests

```yaml
# В test-specialized.yml
s3-tests:
  steps:
    - name: Run S3 specialized tests
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile s3-tests up --build --abort-on-container-exit avatar-backend-s3
```

**Конфигурация:** `settings.test.s3.yaml` **Профиль:** `s3-tests`

### Performance Tests

```yaml
# В test-specialized.yml
performance-tests:
  steps:
    - name: Run performance tests
      run: |
        docker compose -f docker/docker-compose.test-extended.yaml --profile performance-tests up --build --abort-on-container-exit avatar-backend-performance
```

**Конфигурация:** `settings.test.yaml` с `TEST_LOG_LEVEL=warn` **Профиль:**
`performance-tests`

## Конфигурационные файлы

### Структура конфигураций

```
backend/configs/
├── settings.test.unit.yaml      # Unit тесты
│   ├── SQLite in-memory
│   ├── Локальное хранилище
│   └── Минимальное логирование
├── settings.test.yaml           # Основная конфигурация
│   ├── Переменные окружения
│   ├── SQLite и PostgreSQL
│   └── Local и S3 хранилища
├── settings.test.postgres.yaml  # PostgreSQL-специфичные
│   ├── PostgreSQL БД
│   ├── Локальное хранилище
│   └── Оптимизация для интеграционных тестов
├── settings.test.s3.yaml        # S3-специфичные
│   ├── S3/MinIO хранилище
│   ├── SQLite БД
│   └── S3 переменные окружения
└── settings.test.e2e.yaml       # E2E тесты
    ├── PostgreSQL БД
    ├── Локальное хранилище
    └── Полная конфигурация для E2E
```

### Монтирование в Docker Compose

```yaml
# В docker-compose.test-extended.yaml
avatar-backend-unit:
  volumes:
    - ../backend/configs/settings.test.unit.yaml:/app/backend/settings.yaml:ro
    - ../backend/logs:/app/backend/logs
    - test_storage:/app/backend/storage

avatar-backend-integration:
  volumes:
    - ../backend/configs/settings.test.yaml:/app/backend/settings.yaml:ro
    - ../backend/logs:/app/backend/logs

avatar-backend-postgres:
  volumes:
    - ../backend/configs/settings.test.postgres.yaml:/app/backend/settings.yaml:ro
    - ../backend/logs:/app/backend/logs
    - test_storage:/app/backend/storage
```

## Переменные окружения

### Общие переменные

```bash
# Основные
NODE_ENV=test
CONFIG_PATH=./settings.yaml

# Сервер
TEST_SERVER_PORT=3000|3002
TEST_LOG_LEVEL=debug|info|warn|error
```

### База данных

```bash
# Тип БД
TEST_DB_DRIVER=sqlite|postgresql

# PostgreSQL
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_NAME=avatar_gen_test
TEST_DB_USER=test_user
TEST_DB_PASSWORD=test_password
```

### Хранилище

```bash
# Тип хранилища
TEST_STORAGE_TYPE=local|s3

# S3/MinIO
TEST_S3_ENDPOINT=http://localhost:9000
TEST_S3_BUCKET=avatar-gen-test
TEST_S3_ACCESS_KEY=test-access-key
TEST_S3_SECRET_KEY=test-secret-key
TEST_S3_REGION=us-east-1
```

## Локальное тестирование

### Новые скрипты

```bash
# Все тесты
bash scripts/test-all.sh

# Отдельные типы
bash scripts/test-unit.sh         # ~30 секунд
bash scripts/test-integration.sh  # ~2 минуты
bash scripts/test-postgres.sh     # ~1 минута
bash scripts/test-s3.sh           # ~1 минута
bash scripts/test-e2e.sh          # ~5 минут
```

### Старые скрипты (совместимость)

```bash
# Продолжают работать
bash scripts/test-matrix.sh unit
bash scripts/test-with-postgres.sh integration-postgres
bash scripts/test-with-postgres.sh e2e-full
```

## Мониторинг и отчетность

### Новые возможности

1. **Детальные summary**
   - В каждом workflow генерируется подробный отчет
   - Показывает конфигурацию и результаты
   - Доступен в GitHub Actions UI

2. **Отдельные артефакты**
   - Каждый тип тестов сохраняет свои результаты
   - Логи доступны для скачивания
   - Возможность отладки через артефакты

3. **Расширенная статистика**
   - Время выполнения для каждого типа тестов
   - Статус всех компонентов
   - Общая сводка результатов

### Пример summary

```markdown
## 🧪 Unit Test Results

### Configuration Used

- Config: unit
- Database: SQLite (in-memory)
- Storage: Local filesystem

### Test Output
```

PASS src/modules/avatar/avatar.service.spec.ts PASS
src/modules/health/health.controller.spec.ts ...

````

## Troubleshooting

### Частые проблемы миграции

1. **Файлы конфигурации не найдены**
   ```bash
   # Проверить существование файлов
   ls -la backend/configs/settings.test.*.yaml

   # Проверить права доступа
   chmod 644 backend/configs/settings.test.*.yaml
````

2. **Docker Compose профили не работают**

   ```bash
   # Проверить синтаксис docker-compose файла
   docker-compose -f docker/docker-compose.test-extended.yaml config

   # Проверить доступные профили
   docker-compose -f docker/docker-compose.test-extended.yaml --help
   ```

3. **Переменные окружения не применяются**

   ```bash
   # Проверить переменные в контейнере
   docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit env | grep TEST_

   # Проверить конфигурационный файл
   docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml
   ```

### Откат к старой системе

Если нужно временно вернуться к старой системе:

```bash
# Использовать старые docker-compose файлы
docker-compose -f docker/docker-compose.test.yaml --profile integration-tests up

# Использовать старые скрипты
bash scripts/test-matrix.sh unit
```

## Планы развития

### Краткосрочные цели

- [ ] Добавить кеширование Docker образов в новые workflow
- [ ] Оптимизировать время выполнения тестов
- [ ] Добавить уведомления о результатах тестов

### Долгосрочные цели

- [ ] Интеграция с внешними системами мониторинга
- [ ] Автоматическое масштабирование тестовых окружений
- [ ] Интеграция с системами управления секретами

## Заключение

Новая система тестирования предоставляет:

1. **Гибкость** - специализированные конфигурации для каждого типа тестов
2. **Изоляцию** - каждый тип тестов в своем окружении
3. **Автоматизацию** - готовые workflow для всех сценариев
4. **Мониторинг** - детальная отчетность и статистика
5. **Совместимость** - постепенная миграция без нарушения работы

Миграция позволяет улучшить качество тестирования при сохранении обратной
совместимости с существующими процессами.
