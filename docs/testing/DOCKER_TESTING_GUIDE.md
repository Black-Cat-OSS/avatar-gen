# Docker Testing Guide

## Обзор

Этот гайд описывает как запускать тесты Avatar Generator используя основные
docker-compose файлы.

## Доступные окружения

### Development окружение

Используется для разработки с локальными сервисами:

```bash
# Запуск dev окружения
docker-compose -f docker/docker-compose.dev.yml up -d

# Остановка
docker-compose -f docker/docker-compose.dev.yml down
```

### Production окружение

Используется для production деплоя:

```bash
# Запуск production окружения
docker-compose -f docker/docker-compose.prod.yaml up -d

# Остановка
docker-compose -f docker/docker-compose.prod.yaml down
```

## Локальное тестирование

Для локального тестирования используйте стандартные команды npm:

```bash
# Перейти в папку backend
cd backend

# Unit тесты (единственный доступный тип)
npm run test:unit
```

## Основные скрипты

Используйте основные скрипты для управления контейнерами:

```bash
# Запуск сервисов
./scripts/start.sh

# Остановка сервисов
./scripts/stop.sh

# Сборка образов
./scripts/build.sh

# Просмотр логов
./scripts/logs.sh

# Очистка
./scripts/clean.sh
```

## Конфигурация

Убедитесь, что у вас настроены правильные конфигурационные файлы:

- `backend/settings.yaml` - основная конфигурация
- `backend/settings.development.yaml` - для разработки
- `backend/settings.production.yaml` - для production

## Troubleshooting

### Проблемы с портами

Если порты заняты, измените их в docker-compose файлах:

```yaml
services:
  avatar-backend:
    ports:
      - '3001:3000' # Изменить внешний порт
```

### Проблемы с volumes

Убедитесь, что папки существуют:

```bash
mkdir -p backend/storage backend/logs frontend/logs gateway/logs
```

### Просмотр логов

```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs avatar-backend
```

---

**Последнее обновление:** 2025-01-27  
**Версия:** 3.0 (упрощено после рефакторинга)
