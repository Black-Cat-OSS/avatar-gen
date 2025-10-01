# Backend Docker Configuration

Docker конфигурация для backend-части проекта Avatar Generation.

## 📁 Структура

```
backend/docker/
└── Dockerfile          # Multi-stage Dockerfile для оптимизированной сборки
```

## 🐳 Dockerfile

### Multi-stage Build

Используется multi-stage build для оптимизации размера финального образа:

#### Stage 1: Builder
- **Base:** `node:20-alpine`
- **Назначение:** Компиляция TypeScript и сборка приложения
- **Зависимости:** vips-dev, python3, make, g++ (для Sharp)
- **Действия:**
  1. Установка всех зависимостей (включая devDependencies)
  2. Генерация Prisma Client
  3. Сборка TypeScript → JavaScript

#### Stage 2: Production
- **Base:** `node:20-alpine`
- **Назначение:** Финальный минимальный образ для production
- **Зависимости:** vips, curl (только runtime)
- **Действия:**
  1. Установка только production зависимостей
  2. Копирование собранного приложения из builder
  3. Копирование Prisma Client
  4. Настройка окружения

### Оптимизации

```dockerfile
# ✅ Параллельная установка
RUN npm ci --prefer-offline --no-audit

# ✅ Увеличенная память для сборки больших проектов
ENV NODE_OPTIONS="--max-old-space-size=4096"

# ✅ Очистка кэша npm
RUN npm cache clean --force

# ✅ Multi-stage build - только необходимое в production
COPY --from=builder /app/dist ./dist
```

### Размер образа

```
Builder stage:  ~500-600 MB (со всеми dev зависимостями)
Production:     ~200-250 MB (только runtime)
```

## 🚀 Использование

### Локальная сборка

```bash
# Из корня проекта
docker build -f backend/docker/Dockerfile -t avatar-backend:latest ./backend

# Или из директории backend
cd backend
docker build -f docker/Dockerfile -t avatar-backend:latest .
```

### С docker-compose

```bash
# Из корня проекта
docker-compose up --build avatar-backend

# Только backend (без PostgreSQL)
docker-compose up --build avatar-backend --no-deps
```

### Запуск контейнера

```bash
# С SQLite (по умолчанию)
docker run -p 3000:3000 \
  -v $(pwd)/backend/storage:/app/storage \
  avatar-backend:latest

# С PostgreSQL
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/avatar_gen \
  avatar-backend:latest
```

## ⚙️ Переменные окружения

### Обязательные

```bash
NODE_ENV=production              # Режим работы
DATABASE_URL=file:./prisma/...  # URL подключения к БД
CONFIG_PATH=./settings.yaml      # Путь к конфигурации
```

### Опциональные

```bash
PORT=3000                        # Порт сервера (по умолчанию 3000)
HOST=0.0.0.0                    # Хост (по умолчанию 0.0.0.0)
LOG_LEVEL=info                   # Уровень логирования
```

## 📦 Volumes

### Рекомендуемые монтирования

```yaml
volumes:
  # Хранилище (ОБЯЗАТЕЛЬНО для персистентности)
  # Включает аватары (storage/avatars) и SQLite БД (storage/database)
  - ./backend/storage:/app/storage
  
  # Конфигурация (опционально, для изменений без пересборки)
  - ./backend/settings.yaml:/app/settings.yaml:ro
  
  # Логи (опционально, для доступа к логам)
  - ./backend/logs:/app/logs
```

## 🏥 Health Check

Контейнер включает health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Проверка статуса

```bash
# Проверка статуса контейнера
docker ps

# Просмотр health check логов
docker inspect --format='{{json .State.Health}}' avatar-gen-backend
```

## 🔧 Конфигурация сборки

### Build Arguments

Можно передать аргументы при сборке:

```dockerfile
# В Dockerfile (если добавить ARG)
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
```

```bash
# При сборке
docker build --build-arg NODE_VERSION=20 -t avatar-backend .
```

### Кэширование слоев

Dockerfile оптимизирован для максимального использования кэша:

```dockerfile
# 1. Сначала копируем только package*.json
COPY package*.json ./

# 2. Устанавливаем зависимости (кэшируется если package.json не изменился)
RUN npm ci

# 3. Затем копируем исходный код
COPY src ./src
```

## 🐛 Troubleshooting

### Проблема: Ошибка при установке Sharp

```
Error: Cannot find module 'sharp'
```

**Решение:** Убедитесь, что в builder stage установлены зависимости:

```dockerfile
RUN apk add --no-cache vips-dev python3 make g++
```

### Проблема: Prisma Client не найден

```
Error: @prisma/client did not initialize yet
```

**Решение:** Убедитесь, что Prisma Client генерируется и копируется:

```dockerfile
# В builder stage
RUN npx prisma generate

# В production stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
```

### Проблема: База данных недоступна

```
Error: Can't reach database server
```

**Решение для SQLite:**
- Проверьте, что volume смонтирован: `-v ./prisma/storage:/app/prisma/storage`
- Проверьте права доступа к директории

**Решение для PostgreSQL:**
- Проверьте `DATABASE_URL`
- Убедитесь, что PostgreSQL контейнер запущен: `docker-compose up postgres`
- Используйте `depends_on` в docker-compose

### Проблема: Контейнер падает сразу после старта

```bash
# Просмотр логов
docker logs avatar-gen-backend

# Подключение к контейнеру для отладки
docker run -it --entrypoint sh avatar-backend:latest
```

## 📊 Мониторинг

### Просмотр логов

```bash
# Все логи
docker logs avatar-gen-backend

# Следить за логами в реальном времени
docker logs -f avatar-gen-backend

# Последние 100 строк
docker logs --tail 100 avatar-gen-backend
```

### Использование ресурсов

```bash
# Статистика контейнера
docker stats avatar-gen-backend

# Детальная информация
docker inspect avatar-gen-backend
```

## 🔐 Security Best Practices

### 1. Не запускайте от root

```dockerfile
# Создайте non-root пользователя (TODO: добавить в Dockerfile)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs
```

### 2. Используйте секреты для чувствительных данных

```bash
# Используйте Docker secrets или переменные окружения
docker run -e DATABASE_PASSWORD_FILE=/run/secrets/db_password ...
```

### 3. Сканируйте образ на уязвимости

```bash
# С помощью Docker Scout
docker scout cves avatar-backend:latest

# С помощью Trivy
trivy image avatar-backend:latest
```

## 🚀 Production Deployment

### Рекомендации для production

1. **Используйте конкретные версии тегов**
   ```bash
   docker build -t avatar-backend:1.0.0 .
   ```

2. **Настройте правильные health checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

3. **Используйте restart policy**
   ```yaml
   restart: unless-stopped
   ```

4. **Ограничьте ресурсы**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 512M
       reservations:
         cpus: '0.5'
         memory: 256M
   ```

5. **Используйте Docker secrets для credentials**
   ```bash
   docker secret create db_password password.txt
   ```

## 📝 Changelog

### v1.1.0 (2025-10-01)
- Перемещен Dockerfile в `backend/docker/`
- Добавлен health check
- Оптимизирован multi-stage build
- Добавлена документация

### v1.0.0
- Первая версия Dockerfile

## 🔗 Связанные документы

- [Backend README](../README.md)
- [Docker Compose Configuration](../../docker-compose.yml)
- [Deployment Guide](../docs/DEPLOYMENT.md) (TODO)

---

**Последнее обновление:** 2025-10-01  
**Версия:** 1.1.0

