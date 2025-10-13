# Тестирование контейнера Avatar Generator

## 🎯 Цель

Подготовить необходимые окружения для проведения тестирований контейнера **без
изменения Dockerfile**, используя монтирование конфигурационных файлов.

## 🚀 Быстрый старт

### Все тесты одной командой

```bash
bash scripts/test-all.sh
```

### Отдельные типы тестов

```bash
# Unit тесты (самые быстрые)
bash scripts/test-unit.sh

# Integration тесты
bash scripts/test-integration.sh

# PostgreSQL-специфичные тесты
bash scripts/test-postgres.sh

# S2-специфичные тесты
bash scripts/test-s3.sh

# E2E тесты
bash scripts/test-e2e.sh
```

## 📋 Доступные типы тестов

| Тип тестов      | База данных        | Хранилище      | Конфигурация                  | Время |
| --------------- | ------------------ | -------------- | ----------------------------- | ----- |
| **Unit**        | SQLite (in-memory) | Локальное      | `settings.test.unit.yaml`     | ~30с  |
| **Integration** | PostgreSQL         | Локальное + S3 | `settings.test.yaml`          | ~2м   |
| **PostgreSQL**  | PostgreSQL         | Локальное      | `settings.test.postgres.yaml` | ~1м   |
| **S3**          | SQLite             | S3/MinIO       | `settings.test.s3.yaml`       | ~1м   |
| **E2E**         | PostgreSQL         | Локальное      | `settings.test.e2e.yaml`      | ~5м   |

## 🏗️ Архитектура

### Принципы

- ✅ **Dockerfile не изменяется**
- ✅ **Монтирование конфигураций через volumes**
- ✅ **Изолированные тестовые окружения**
- ✅ **Гибкие конфигурации для разных сценариев**

### Структура конфигураций

```
backend/configs/
├── settings.test.yaml          # Основная конфигурация
├── settings.test.unit.yaml     # Unit тесты
├── settings.test.postgres.yaml # PostgreSQL тесты
├── settings.test.s3.yaml       # S3 тесты
├── settings.test.e2e.yaml      # E2E тесты
└── settings.test.minio.yaml    # MinIO тесты

gateway/configs/
├── nginx.test.conf             # Основная nginx конфигурация
├── nginx.test.unit.conf        # Unit тесты
└── nginx.test.integration.conf # Integration тесты
```

## 🐳 Docker Compose профили

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

## 📖 Документация

- [**Docker Testing Guide**](DOCKER_TESTING_GUIDE.md) - Подробное руководство
- [**Примеры использования**](TESTING_EXAMPLES.md) - Практические примеры
- [**Конфигурации Backend**](../backend/configs/README.md) - Описание
  конфигураций

## 🔧 Отладка

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose -f docker/docker-compose.test-extended.yaml logs -f

# Логи конкретного сервиса
docker-compose -f docker/docker-compose.test-extended.yaml logs -f avatar-backend-unit
```

### Вход в контейнер

```bash
# Вход в backend контейнер
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit bash

# Проверка конфигурации
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml
```

### Проверка состояния

```bash
# Статус контейнеров
docker-compose -f docker/docker-compose.test-extended.yaml ps

# Health check статус
docker-compose -f docker/docker-compose.test-extended.yaml ps --format "table {{.Name}}\t{{.Status}}"
```

## 🚨 Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверьте конфигурацию
docker-compose -f docker/docker-compose.test-extended.yaml config

# Пересоберите без кеша
docker-compose -f docker/docker-compose.test-extended.yaml build --no-cache
```

### Проблема: Тесты падают

```bash
# Проверьте логи тестов
docker-compose -f docker/docker-compose.test-extended.yaml logs avatar-backend-unit

# Запустите тесты с verbose выводом
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit npm run test:unit --verbose
```

### Проблема: Нет доступа к конфигурации

```bash
# Проверьте монтирование
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit ls -la /app/backend/

# Проверьте содержимое файла
docker-compose -f docker/docker-compose.test-extended.yaml exec avatar-backend-unit cat /app/backend/settings.yaml
```

## 💡 Лучшие практики

1. **Используйте профили для изоляции** - каждый тип тестов в своем окружении
2. **Очищайте ресурсы после тестов** - используйте `--remove-orphans`
3. **Используйте подходящие уровни логирования** - error для unit, debug для
   integration
4. **Мониторьте ресурсы** - используйте `docker stats` для контроля

## 🔄 CI/CD интеграция

### GitHub Actions

```yaml
- name: Run Tests
  run: bash scripts/test-all.sh
```

### GitLab CI

```yaml
test:
  script:
    - bash scripts/test-all.sh
```

## 📊 Результаты

После выполнения тестов вы получите:

- ✅ **Отчет о пройденных тестах**
- 📋 **Логи для каждого типа тестов**
- 🧹 **Автоматическая очистка ресурсов**
- 📈 **Статистику выполнения**

---

**🎉 Готово!** Теперь у вас есть полноценная система тестирования контейнера без
изменения Dockerfile.
