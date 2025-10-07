# Руководство по развертыванию

Документация по развертыванию Avatar Generator в различных окружениях.

## 📚 Содержание

### Docker

- **[Docker Compose Configuration](./DOCKER_COMPOSE.md)** ✅  
  Детальное руководство по docker-compose конфигурации

- **[Docker README](../../docker/README.md)** ✅  
  Основная документация Docker (compose файлы, структура)

- **[Docker Build Fixes](../../docker/DOCKER_BUILD_FIXES.md)** ✅  
  Решение проблем при сборке образов

### Скрипты управления

- **[Scripts Documentation](./SCRIPTS.md)** ✅  
  Полная документация всех скриптов управления

### Production развертывание

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** ✅  
  Полное руководство по развертыванию в различных окружениях

- **[Production Guide](./production.md)** 🟡 Создается  
  Рекомендации для production развертывания

## 🚀 Быстрое развертывание

### Локальное развертывание (Docker)

```bash
# SQLite (рекомендуется для разработки)
./scripts/build.sh sqlite
./scripts/start.sh sqlite

# PostgreSQL (рекомендуется для production)
./scripts/build.sh postgresql
./scripts/start.sh postgresql
```

### Автоматическая генерация конфигурации

При запуске приложения автоматически выполняется:

1. **Генерация `.env` файла** - создается на основе YAML конфигурации
2. **Выбор правильной схемы Prisma** - автоматически переключается между
   SQLite/PostgreSQL
3. **Генерация Prisma Client** - с правильным провайдером базы данных
4. **Синхронизация схемы БД** - выполняется `prisma db push`

**Важно:** `.env` файл генерируется автоматически и не должен попадать в
исходный код.

### Доступ к сервисам

После запуска сервисы будут доступны:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000
- **Swagger:** http://localhost:3000/swagger
- **Health Check:** http://localhost:3000/api/health

## 📦 Профили развертывания

### SQLite профиль

**Когда использовать:**

- Разработка и тестирование
- Небольшие развертывания
- Прототипирование

**Запуск:**

```bash
./scripts/start.sh sqlite
```

### PostgreSQL профиль

**Когда использовать:**

- Production окружение
- Высокие нагрузки
- Требуется масштабирование

**Запуск:**

```bash
./scripts/start.sh postgresql
```

## 🐳 Docker команды

### Управление через скрипты

```bash
./scripts/build.sh [profile]        # Сборка образов
./scripts/build-fast.sh [profile]   # Быстрая сборка (с кэшем)
./scripts/start.sh [profile]        # Запуск сервисов
./scripts/dev.sh [profile]          # Dev режим (фоновый)
./scripts/stop.sh [--volumes]       # Остановка
./scripts/logs.sh [service]         # Просмотр логов
./scripts/clean.sh                  # Очистка Docker
```

### Прямые Docker команды

```bash
# SQLite
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up

# PostgreSQL
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up
```

## 🔧 Конфигурация

### Backend настройки

Основная конфигурация в `backend/settings.yaml`:

```yaml
app:
  save_path: './storage/avatars'
  server:
    host: '0.0.0.0'
    port: 3000
  database:
    driver: 'sqlite' # или "postgresql"
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
```

### Переменные окружения

**Автоматическая генерация:** Все переменные окружения генерируются
автоматически из YAML конфигурации при запуске контейнера.

**Ручная настройка (опционально):**

```bash
# Backend (генерируются автоматически)
NODE_ENV=production
DATABASE_PROVIDER=sqlite|postgresql
DATABASE_URL=<connection string>
CONFIG_PATH=./settings.yaml

# PostgreSQL (для внешней БД)
POSTGRES_DB=avatar_gen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

**Генерация `.env` файла:**

```bash
# .env файл создается автоматически в start.sh
# Содержимое:
DATABASE_URL="postgresql://postgres:password@postgres:5432/avatar_gen?sslmode=disable"
NODE_ENV=development
```

## 📊 Мониторинг

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend health (через Nginx)
curl http://localhost/

# PostgreSQL (если используется)
docker-compose exec postgres pg_isready
```

### Логи

```bash
# Все сервисы
docker-compose -f docker/docker-compose.yml logs -f

# Конкретный сервис
docker-compose -f docker/docker-compose.yml logs -f avatar-backend

# Backend логи (host)
tail -f backend/logs/*.log

# Frontend логи (host)
tail -f frontend/logs/*.log
```

## 🔒 Security

### Production Checklist

- [ ] Изменить пароли БД
- [ ] Настроить HTTPS
- [ ] Настроить firewall
- [ ] Использовать Docker secrets
- [ ] Регулярно обновлять образы
- [ ] Настроить backup стратегию

## 📚 Детальная документация

- [Docker Compose Configuration](./DOCKER_COMPOSE.md) - Детальная конфигурация
- [Docker README](../../docker/README.md) - Структура и использование
- [Scripts Documentation](./SCRIPTS.md) - Все скрипты
- [Production Guide](./production.md) - Production рекомендации

## 🔗 Связанные разделы

- [Development Guide](../development/README.md) - Разработка
- [Getting Started](../getting-started/README.md) - Быстрый старт
- [Troubleshooting](../development/TROUBLESHOOTING.md) - Решение проблем

---

**Обновлено:** 2025-10-03
