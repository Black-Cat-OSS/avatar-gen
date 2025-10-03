# Backend Docker Configuration

Конфигурация Docker для backend приложения Avatar Generator.

## 📋 Структура

```
backend/
├── docker/
│   ├── Dockerfile        # Multi-stage build конфигурация
│   └── README.md         # Этот файл
├── start.sh              # Startup script (ВАЖНО!)
├── settings.yaml         # Конфигурация
└── ...
```

## 🐳 Dockerfile

### Multi-stage build

**Stage 1: Builder**
- Базовый образ: `node:20-alpine`
- Установка зависимостей для Sharp (vips-dev, python3, make, g++)
- Копирование исходного кода
- Генерация Prisma client
- Компиляция TypeScript → JavaScript

**Stage 2: Production**
- Базовый образ: `node:20-alpine`
- Установка только runtime зависимостей
- Копирование скомпилированного кода из builder
- Копирование конфигурации и скриптов
- Создание директорий storage

## 📁 Важные файлы

### start.sh

**⚠️ КРИТИЧЕСКИ ВАЖНО:** Файл `start.sh` должен находиться в `backend/` директории!

**Расположение:** `backend/start.sh`  
**Назначение:** Инициализация и запуск приложения

```bash
#!/bin/sh

# Always create a fresh database in container
echo "Creating fresh database..."
npx prisma migrate deploy

# Start the application
echo "Starting avatar generator application..."
exec node dist/main.js
```

**Почему это важно:**
- Dockerfile копирует `start.sh` из корня контекста (backend/)
- В `.dockerignore` добавлено исключение `!start.sh`
- Без этого файла контейнер не запустится

### settings.yaml

**Расположение:** `backend/settings.yaml`  
**Назначение:** Конфигурация приложения

Монтируется как volume в docker-compose для возможности изменения без пересборки.

## 🚀 Сборка образа

### Через Docker напрямую

```bash
# Из корня проекта
docker build -t avatar-backend -f backend/docker/Dockerfile backend/

# Из директории backend
cd backend
docker build -t avatar-backend -f docker/Dockerfile .
```

### Через Docker Compose

```bash
# Из корня проекта
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml build avatar-backend

# Или через скрипты
./scripts/build.sh sqlite
```

## 🔧 Конфигурация build context

Docker Compose использует:
```yaml
services:
  avatar-backend:
    build:
      context: ../backend      # Контекст сборки
      dockerfile: docker/Dockerfile  # Относительно context
```

**Это означает:**
- Контекст сборки: `backend/` директория
- Dockerfile: `backend/docker/Dockerfile`
- Все `COPY` команды относительно `backend/`

## 📦 Что копируется в образ

### Builder stage
```dockerfile
COPY package*.json ./           # Для npm install
COPY src ./src                  # Исходный код
COPY prisma ./prisma            # Prisma schema
COPY tsconfig.json ./           # TypeScript config
COPY nest-cli.json ./           # NestJS config
```

### Production stage
```dockerfile
COPY --from=builder /app/dist ./dist                      # Скомпилированный код
COPY --from=builder /app/node_modules/.prisma ./...      # Prisma client
COPY settings.yaml ./                                     # Конфигурация
COPY start.sh ./start.sh                                  # Startup script ← ВАЖНО!
```

## 🐛 Troubleshooting

### Ошибка: `/app/start.sh: not found`

**Причина:** Файл `start.sh` не попал в образ

**Решение:**

1. Проверьте наличие файла:
```bash
ls -la backend/start.sh
# Должен существовать и быть исполняемым
```

2. Проверьте `.dockerignore`:
```bash
cat backend/.dockerignore | grep start.sh
# Не должен игнорироваться (или должен быть !start.sh)
```

3. Пересоберите образ:
```bash
./scripts/build.sh sqlite --build
# или
docker-compose -f docker/docker-compose.yml build --no-cache avatar-backend
```

4. Проверьте что файл попал в образ:
```bash
docker run --rm --entrypoint ls avatar-backend -la /app/start.sh
```

### Ошибка при установке Sharp

**Причина:** Временные проблемы с Alpine репозиториями

**Решение:** В Dockerfile используется retry логика с альтернативными зеркалами (Yandex):
```dockerfile
RUN for i in 1 2 3; do \
    apk update && apk add --no-cache vips-dev python3 make g++ && break || \
    { echo "Retry $i/3 failed..."; sleep 5; }; \
  done
```

### Проблемы с правами доступа

**Проблема:** Ошибки доступа к `storage/` директории

**Решение:**

На хосте:
```bash
chmod -R 777 backend/storage
```

Или в Dockerfile:
```dockerfile
RUN mkdir -p storage/avatars storage/database && \
    chmod -R 777 storage
```

## ⚙️ Environment Variables

### Build-time (ARG)

Нет build-time переменных.

### Runtime (ENV)

```dockerfile
ENV NODE_ENV=production
ENV DATABASE_URL="file:./storage/database/database.sqlite"
ENV CONFIG_PATH="./settings.yaml"
```

Можно переопределить в docker-compose:
```yaml
environment:
  NODE_ENV: production
  DATABASE_PROVIDER: sqlite
  DATABASE_URL: file:./storage/database/database.sqlite
```

## 📊 Volumes

Монтируются в docker-compose:

```yaml
volumes:
  - ../backend/storage:/app/storage         # Persistent storage
  - ../backend/settings.yaml:/app/settings.yaml  # Конфигурация
  - ../backend/logs:/app/logs               # Логи
```

## 🏥 Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

**Проверка:**
```bash
docker inspect avatar-gen-backend --format='{{.State.Health.Status}}'
```

## 🔐 Security

### Best Practices

1. **Multi-stage build** - минимальный размер production образа
2. **Non-root user** - TODO: добавить
3. **Minimal dependencies** - только production deps в final stage
4. **No secrets in image** - используйте volumes для настроек

### Рекомендации для production

```dockerfile
# Добавить non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs
```

## 📈 Optimization

### Размер образа

- **Builder stage:** ~800MB (с dev dependencies)
- **Production stage:** ~200MB (без dev dependencies)

### Кэширование слоев

```dockerfile
# 1. Сначала COPY package files (меняются редко)
COPY package*.json ./
RUN npm install

# 2. Затем COPY исходный код (меняется часто)
COPY src ./src
RUN npm run build
```

### Параллельная компиляция

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build
```

## 🔗 Связанные документы

- [Docker Compose Configuration](../../docker/README.md)
- [Docker Build Fixes](../../docker/DOCKER_BUILD_FIXES.md)
- [Backend README](../README.md)
- [Backend Docs](../docs/README.md)

---

**Обновлено:** 2025-10-03  
**Версия:** 1.1 (исправлена проблема с start.sh)
