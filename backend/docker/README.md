# Backend Docker Configuration

Документация по Docker конфигурации backend сервиса Avatar Generator.

## 📦 Содержание

- [Dockerfile](#dockerfile) - Multi-stage сборка приложения
- [Конфигурации](#конфигурации) - Монтирование конфигурационных файлов
- [Использование](#использование) - Примеры запуска
- [Переменные окружения](#переменные-окружения) - Конфигурация через env
- [Storage Configuration](#storage-configuration) - Настройка хранилища

---

## Конфигурации

### ⚠️ Важно: Конфигурации монтируются как volumes

**Конфигурационные файлы НЕ копируются в Docker образ!**

Dockerfile **НЕ содержит** строку `COPY settings.yaml`. Вместо этого конфигурации монтируются при запуске:

```yaml
# docker-compose.yml
services:
  avatar-backend:
    volumes:
      - ../backend/settings.yaml:/app/settings.yaml:ro
      - ../backend/settings.production.yaml:/app/settings.production.yaml:ro
```

### Преимущества подхода

1. **Безопасность** - credentials не включаются в образ
2. **Гибкость** - разные конфиги для разных окружений без пересборки
3. **Read-only** - контейнер не может изменить конфигурацию
4. **Быстрое обновление** - изменил конфиг → перезапустил контейнер

### Обязательные файлы

Перед запуском контейнера убедитесь что существуют:

```bash
backend/
├── settings.yaml              # Базовая конфигурация (обязательно)
└── settings.production.yaml   # Production конфигурация (обязательно)
```

Если их нет:
```bash
# Создайте из примера
cp backend/settings.yaml backend/settings.production.yaml
# Отредактируйте под ваше окружение
```

### Путь в контейнере

- Хост: `backend/settings.yaml` → Контейнер: `/app/settings.yaml`
- Хост: `backend/settings.production.yaml` → Контейнер: `/app/settings.production.yaml`

### Изменение конфигурации

```bash
# 1. Отредактируйте файл на хосте
nano backend/settings.production.yaml

# 2. Перезапустите контейнер
docker-compose -f docker/docker-compose.yml restart avatar-backend

# Готово! Новая конфигурация применена
```

---

## Dockerfile

### Архитектура

Multi-stage build для оптимизации размера образа:

1. **Builder stage** - сборка приложения
   - Установка всех зависимостей
   - Генерация Prisma client
   - Компиляция TypeScript → JavaScript

2. **Production stage** - финальный образ
   - Только production зависимости
   - Скомпилированный код
   - Runtime окружение

### Особенности

- ✅ Alpine Linux для минимального размера
- ✅ Поддержка Sharp (image processing)
- ✅ Retry логика для установки пакетов
- ✅ Health check
- ✅ Оптимизация кэширования слоев

---

## Использование

### Локальная сборка

```bash
# Сборка образа
docker build -f docker/Dockerfile -t avatar-backend:latest .

# Запуск контейнера (с локальным хранилищем)
docker run -p 3000:3000 \
  -v $(pwd)/storage:/app/storage \
  -e NODE_ENV=production \
  avatar-backend:latest
```

### С S3 хранилищем

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e STORAGE_TYPE=s3 \
  -e S3_ENDPOINT=https://s3.example.com \
  -e S3_BUCKET=my-bucket \
  -e S3_ACCESS_KEY=your-key \
  -e S3_SECRET_KEY=your-secret \
  avatar-backend:latest
```

---

## Переменные окружения

### Обязательные

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `NODE_ENV` | Окружение | `production` |
| `CONFIG_PATH` | Путь к конфигу | `./settings.yaml` |

### Для PostgreSQL

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `DATABASE_URL` | Connection string | `postgresql://user:pass@host:5432/db` |

### Для S3 Storage

| Переменная | Обязательная | Описание | Пример |
|-----------|--------------|----------|--------|
| `STORAGE_TYPE` | ✅ Да | Тип хранилища | `s3` |
| `S3_ENDPOINT` | ✅ Да | URL endpoint | `https://s3.example.com` |
| `S3_BUCKET` | ✅ Да | Имя бакета | `my-bucket` |
| `S3_ACCESS_KEY` | ✅ Да | Access key | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_KEY` | ✅ Да | Secret key | `wJalrXUtnFEMI/K7MDENG/...` |
| `S3_REGION` | ❌ Нет | Регион | `us-east-1` (по умолчанию) |
| `S3_FORCE_PATH_STYLE` | ❌ Нет | Path-style URLs | `true` (по умолчанию) |

---

## Storage Configuration

### Local Storage (по умолчанию)

```yaml
# settings.production.yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
```

**Docker volumes:**
```yaml
volumes:
  - ./storage:/app/storage  # Монтируем локальную директорию
```

### S3 Storage

```yaml
# settings.production.yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://s3.example.com'
      bucket: 'avatars'
      # ... остальные параметры из переменных окружения
```

**Docker volumes:**
```yaml
volumes:
  # storage директория НЕ монтируется - используется S3
  - ./logs:/app/logs
```

**Environment:**
```yaml
environment:
  - STORAGE_TYPE=s3
  - S3_ENDPOINT=https://s3.example.com
  - S3_BUCKET=avatars
  - S3_ACCESS_KEY=${S3_ACCESS_KEY}
  - S3_SECRET_KEY=${S3_SECRET_KEY}
```

---

## Health Check

Контейнер автоматически проверяет здоровье приложения:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

**Параметры:**
- `interval: 30s` - проверка каждые 30 секунд
- `timeout: 3s` - таймаут для проверки
- `start-period: 5s` - время на запуск приложения
- `retries: 3` - количество неудачных проверок перед признанием unhealthy

---

## Troubleshooting

### Контейнер не запускается с S3

**Проверьте:**
1. Все S3 переменные окружения установлены
2. S3 endpoint доступен из контейнера
3. Credentials корректны
4. Бакет существует

```bash
# Проверка логов
docker logs avatar-gen-backend

# Проверка переменных окружения
docker exec avatar-gen-backend env | grep S3
```

### Permission denied на storage директории

**Для local storage:**
```bash
# Установите правильные права
chmod -R 755 backend/storage
chown -R 1000:1000 backend/storage
```

**Для S3:**
Проблема не возникает, так как storage директория не используется

---

## Примеры

### Development с локальным хранилищем

```bash
docker build -f docker/Dockerfile -t avatar-backend:dev .
docker run -p 3001:3000 \
  -v $(pwd)/storage:/app/storage \
  -e NODE_ENV=development \
  avatar-backend:dev
```

### Production с S3

```bash
docker build -f docker/Dockerfile -t avatar-backend:prod .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e STORAGE_TYPE=s3 \
  -e S3_ENDPOINT=https://s3.example.com \
  -e S3_BUCKET=prod-avatars \
  -e S3_ACCESS_KEY=${S3_ACCESS_KEY} \
  -e S3_SECRET_KEY=${S3_SECRET_KEY} \
  avatar-backend:prod
```

---

**Обновлено:** 2025-10-04  
**Версия:** 0.0.2
