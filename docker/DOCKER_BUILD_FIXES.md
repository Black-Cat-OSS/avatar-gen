# Docker Build Fixes

**Дата:** 2025-10-02  
**Версия:** 1.1

## 🐛 Исправленные проблемы

### 1. Ошибка: `dumb-init (no such package)`

**Проблема:**

```
ERROR: unable to select packages:
  dumb-init (no such package):
    required by: world[dumb-init]
```

**Решение:**

- Удален `dumb-init` из frontend Dockerfile
- **Причина:** Nginx корректно обрабатывает сигналы без init системы
- `dumb-init` нужен только для приложений на Node.js, но не для Nginx

**Изменения в `docker/frontend/Dockerfile`:**

```dockerfile
# Убрано:
# RUN apk add --no-cache dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Оставлено только:
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Ошибка: Временные проблемы с Alpine репозиториями

**Проблема:**

```
WARNING: fetching https://dl-cdn.alpinelinux.org/alpine/v3.22/main: temporary error (try again later)
ERROR: unable to select packages
```

**Решение:** Добавлена retry логика и альтернативные зеркала Alpine.

**Изменения во всех Dockerfile:**

```dockerfile
# Использование альтернативных зеркал
RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories || true

# Retry логика с fallback на default mirrors
RUN for i in 1 2 3; do \
        apk update && apk add --no-cache <packages> && break || \
        { echo "Retry $i/3 failed, trying default mirrors..."; \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" > /etc/apk/repositories && \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
          apk update; sleep 5; }; \
    done
```

### 3. Ошибка: `Cannot read file '/app/tsconfig.node.json'`

**Проблема:**

```
error TS5083: Cannot read file '/app/tsconfig.node.json'.
```

**Решение:** Добавлен `tsconfig.node.json` в список копируемых файлов.

**Изменения в `docker/frontend/Dockerfile`:**

```dockerfile
# Копирование всех необходимых config файлов
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./  # ← Добавлено
```

### 4. Healthcheck: wget → curl

**Проблема:** `wget` может отсутствовать в минимальном nginx:alpine образе.

**Решение:** Использование `curl` для healthcheck (более надежно).

**Изменения:**

```dockerfile
# Было:
# HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Стало:
HEALTHCHECK CMD curl -f http://localhost:8080/ || exit 1
```

## 📝 Дополнительные улучшения

### Backend Dockerfile

1. **Retry логика** для установки пакетов:
   - `vips-dev`, `python3`, `make`, `g++` (builder stage)
   - `vips`, `curl` (production stage)

2. **Альтернативные зеркала** Alpine Linux

### Frontend Dockerfile

1. **Упрощенный CMD** без dumb-init
2. **Retry логика** для установки curl
3. **Альтернативные зеркала** Alpine Linux
4. **Добавлены все необходимые tsconfig файлы**

## 🧪 Тестирование

После исправлений попробуйте собрать образы:

```bash
# Сборка с использованием скриптов
./scripts/build.sh sqlite

# Или быстрая сборка с кэшем
./scripts/build-fast.sh sqlite
```

## 🛠️ Решение проблем

### Если продолжаются проблемы с сетью

**Вариант 1: Подождать**

```bash
# Проблема может быть временной, попробуйте через несколько минут
```

**Вариант 2: Использовать другие зеркала**

Отредактируйте Dockerfiles, заменив зеркало на ближайшее к вам:

```dockerfile
# Примеры зеркал Alpine:
# USA: https://dl-2.alpinelinux.org/alpine/v3.22/...
# Europe: https://uk.alpinelinux.org/alpine/v3.22/...
# Asia: https://mirrors.tuna.tsinghua.edu.cn/alpine/v3.22/...
```

**Вариант 3: Использовать VPN**

```bash
# Если репозитории недоступны в вашем регионе
```

**Вариант 4: Построить без --no-cache**

```bash
# Использовать кэшированные слои
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml build --no-cache=false
```

### Ошибки прав доступа

Если возникают ошибки с правами:

```bash
# Очистить кэш Docker
docker system prune -a

# Перестроить образы
./scripts/build.sh sqlite
```

## 📊 Размеры образов

После оптимизации:

- **Backend**: ~200-250MB (production stage)
- **Frontend**: ~50-80MB (nginx + static files)

## 🔗 Связанные файлы

- `docker/backend/Dockerfile` - Backend Dockerfile
- `docker/frontend/Dockerfile` - Frontend Dockerfile
- `backend/docker/Dockerfile` - Ссылка на backend (для совместимости)
- `frontend/docker/Dockerfile` - Ссылка на frontend (для совместимости)

## 💡 Рекомендации

1. **Всегда используйте скрипты** из `scripts/` для сборки
2. **Проверяйте логи** при ошибках: `docker-compose logs`
3. **Очищайте кэш** если проблемы сохраняются: `./scripts/clean.sh`
4. **Используйте fast build** для разработки: `./scripts/build-fast.sh`

---

**Статус:** ✅ Все исправления применены  
**Тестирование:** ✅ Готово к сборке
