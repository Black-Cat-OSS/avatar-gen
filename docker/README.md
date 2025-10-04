# Docker Configuration

Директория содержит всю конфигурацию Docker для проекта Avatar Generator.

## 📁 Структура

```
docker/
├── docker-compose.yml           # Базовая конфигурация для всех профилей
├── docker-compose.sqlite.yml    # Настройки для SQLite профиля
├── docker-compose.postgresql.yml# Настройки для PostgreSQL профиля
└── README.md                    # Эта документация

Dockerfile остаются в своих модулях:
backend/docker/
├── Dockerfile                   # Dockerfile для backend (NestJS)
└── README.md                    # Документация backend образа

frontend/docker/
└── Dockerfile                   # Dockerfile для frontend (React + Nginx)
```

## 🚀 Использование

### Подготовка конфигурации

**Перед первым запуском убедитесь что конфигурационные файлы существуют:**

```bash
# Проверьте наличие конфигураций
ls -la backend/settings.yaml backend/settings.production.yaml

# Если их нет, скопируйте из примера
cp backend/env.example backend/.env
```

**Важно:** Конфигурации монтируются как volumes и **НЕ включаются** в Docker
образ.

### Запуск с SQLite (по умолчанию)

```bash
# Из корня проекта
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up

# Или используйте скрипты
./scripts/start.sh sqlite
```

**Конфигурация для SQLite:**

```yaml
# backend/settings.yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
```

### Запуск с PostgreSQL

```bash
# Из корня проекта
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up

# Или используйте скрипты
./scripts/start.sh postgresql
```

### Запуск с S3 хранилищем

```bash
# Установите переменные окружения для S3
export S3_ENDPOINT=https://s3.example.com
export S3_BUCKET=my-bucket
export S3_ACCESS_KEY=xxx
export S3_SECRET_KEY=yyy

# Запустите с S3 профилем
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.s3.yml up
```

**Конфигурация для S3:**

```yaml
# backend/settings.production.yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3-endpoint.com'
      bucket: 'my-bucket'
      # ... другие параметры S3
```

### Сборка образов

```bash
# Используйте скрипты для удобства
./scripts/build.sh sqlite
./scripts/build.sh postgresql

# Или напрямую
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml build
```

## 📋 Docker Compose файлы

### docker-compose.yml

Основной файл, содержит:

- Определение сервисов (backend, frontend, postgres)
- Конфигурацию сети
- Volumes
- Health checks
- Порты и базовые настройки

### docker-compose.sqlite.yml

Дополнительный файл для SQLite профиля:

- Переопределяет переменные окружения для SQLite
- Убирает зависимость от PostgreSQL

### docker-compose.postgresql.yml

Дополнительный файл для PostgreSQL профиля:

- Переопределяет переменные окружения для PostgreSQL
- Добавляет зависимость от postgres сервиса

## 🐳 Dockerfiles

### Backend (backend/docker/Dockerfile)

Multi-stage сборка для оптимизации:

- **Builder stage**: Сборка TypeScript → JavaScript
- **Production stage**: Минимальный образ только с runtime зависимостями

Особенности:

- Node.js 20 Alpine (минимальный размер)
- Поддержка Sharp для обработки изображений
- Prisma для работы с БД
- Health check встроен

### Frontend (frontend/docker/Dockerfile)

Multi-stage сборка:

- **Builder stage**: Сборка React приложения (Vite)
- **Production stage**: Nginx для раздачи статики

Особенности:

- Nginx Alpine (минимальный размер)
- Оптимизированная конфигурация Nginx
- Поддержка gzip сжатия
- Проксирование API запросов на backend

## 🔧 Переменные окружения

### Backend

```bash
NODE_ENV=production
DATABASE_PROVIDER=sqlite|postgresql
DATABASE_URL=<connection string>
CONFIG_PATH=./settings.yaml
```

### PostgreSQL

```bash
POSTGRES_DB=avatar_gen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

## 📊 Volumes

### Backend

- `../backend/storage:/app/storage` - Хранилище аватаров и SQLite БД (только для
  local storage)
- `../backend/settings.yaml:/app/settings.yaml:ro` - Базовая конфигурация
  (read-only)
- `../backend/settings.production.yaml:/app/settings.production.yaml:ro` -
  Production конфигурация (read-only)
- `../backend/logs:/app/logs` - Логи приложения

**Важно:**

- Конфигурационные файлы монтируются как **read-only** (`ro`)
- Они **НЕ копируются** в образ при сборке
- Изменения конфигурации не требуют пересборки образа
- Убедитесь что `settings.yaml` и `settings.production.yaml` существуют перед
  запуском

### Frontend

- `../frontend/logs:/var/log/nginx` - Логи Nginx

### PostgreSQL

- `postgres_data` - Данные PostgreSQL (Docker volume)

## 🌐 Сетевые настройки

### Порты

- **80** - Frontend (HTTP)
- **443** - Frontend (HTTPS)
- **3000** - Backend API
- **5432** - PostgreSQL (только для PostgreSQL профиля)

### DNS серверы

**Для S3 подключения требуются DNS серверы:**

```yaml
avatar-backend:
  dns:
    - 8.8.8.8 # Google DNS Primary
    - 8.8.4.4 # Google DNS Secondary
    - 1.1.1.1 # Cloudflare DNS
```

**Зачем это нужно:**

- Docker контейнеры по умолчанию используют DNS хост-системы
- При работе с внешними S3 сервисами (например, `your-s3-endpoint.com`)
  требуется DNS резолвинг
- Без явно указанных DNS серверов может возникать ошибка `EAI_AGAIN` (DNS
  resolution failed)
- Настройка применяется для всех compose файлов, включая `docker-compose.s3.yml`

## 🏥 Health Checks

### Backend

```bash
curl -f http://localhost:3000/api/health
```

- Интервал: 30s
- Timeout: 10s
- Retries: 3
- Start period: 40s

### Frontend

```bash
curl -f http://localhost/health
```

- Интервал: 30s
- Timeout: 10s
- Retries: 3
- Start period: 10s

### PostgreSQL

```bash
pg_isready -U postgres -d avatar_gen
```

- Интервал: 10s
- Timeout: 5s
- Retries: 5
- Start period: 30s

## 🔗 Сети

Все сервисы подключены к сети `avatar-gen-network` (bridge driver).

## 📝 Примечания

1. **Контексты сборки** - используются относительные пути от директории
   `docker/`
2. **Dockerfile пути** - указывают на файлы в `backend/docker/` и
   `frontend/docker/`
3. **Volume paths** - все пути относительны от директории `docker/`
4. **Конфигурации монтируются извне:**
   - ✅ Конфигурационные файлы НЕ включаются в образ
   - ✅ Монтируются как volumes при запуске контейнера
   - ✅ Можно изменять без пересборки образа
   - ✅ Используется read-only режим для безопасности
5. **Хранилище:**
   - Для `local` storage - монтируется `../backend/storage`
   - Для `s3` storage - локальный storage не монтируется, используется S3

## 🔄 Изменение конфигурации без пересборки

Благодаря монтированию конфигураций, вы можете:

1. **Изменить `settings.yaml` или `settings.production.yaml`**
2. **Перезапустить контейнеры:**
   ```bash
   docker-compose -f docker/docker-compose.yml restart avatar-backend
   ```
3. **Новая конфигурация применится** без пересборки образа

### Пример: переключение с local на s3

```bash
# 1. Остановите контейнеры
docker-compose -f docker/docker-compose.yml down

# 2. Обновите backend/settings.production.yaml:
#    storage.type: 's3'

# 3. Запустите с S3 профилем
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.s3.yml up -d
```

## 🛠️ Разработка

### Локальная разработка без Docker

Для разработки без Docker см.:

- [Backend развертывание](../backend/README.md)
- [Frontend развертывание](../frontend/README.md)

### Отладка контейнеров

```bash
# Войти в backend контейнер
docker-compose -f docker/docker-compose.yml exec avatar-backend sh

# Войти в frontend контейнер
docker-compose -f docker/docker-compose.yml exec avatar-frontend sh

# Просмотр логов
docker-compose -f docker/docker-compose.yml logs -f [service_name]
```

## 🔧 Troubleshooting

### S3 подключение: `getaddrinfo EAI_AGAIN`

**Проблема:**

```
ERROR: S3 health check failed: getaddrinfo EAI_AGAIN your-s3-endpoint.com
```

**Причина:** Docker контейнер не может разрешить DNS имя S3 сервиса.

**Решение:** DNS серверы уже настроены в `docker-compose.yml`:

```yaml
avatar-backend:
  dns:
    - 8.8.8.8
    - 8.8.4.4
    - 1.1.1.1
```

Если проблема сохраняется:

1. Проверьте сетевое подключение хост-машины
2. Убедитесь что Docker имеет доступ к интернету
3. Попробуйте пересоздать контейнеры: `docker-compose down && docker-compose up`

### LocalStorageModule: `Local storage path is not configured`

**Проблема:**

```
ERROR: LocalStorageModule initialization failed: Local storage path is not configured
```

**Причина:** Используется S3 хранилище, но `LocalStorageModule` пытается
инициализироваться.

**Решение:** Убедитесь что в `settings.yaml`:

```yaml
app:
  storage:
    type: 's3' # НЕ 'local'
    s3:
      # ... S3 конфигурация
```

Модуль автоматически пропустит инициализацию, если `type !== 'local'`.

### Database configuration missing

**Проблема:**

```
ERROR: app.database: Invalid input: expected object, received undefined
```

**Причина:** Секция `database` отсутствует или закомментирована в
`settings.yaml`.

**Решение:** Раскомментируйте секцию database:

```yaml
app:
  database:
    driver: 'postgresql'
    network:
      host: 'postgres'
      # ... остальные настройки
```

## 📚 Дополнительная документация

- [Backend Dockerfile](../backend/docker/README.md)
- [Общая документация Docker Compose](../docs/DOCKER_COMPOSE_README.md)
- [Скрипты управления](../docs/deployment/SCRIPTS.md)
- [Исправления сборки](./DOCKER_BUILD_FIXES.md)

---

**Последнее обновление:** 2025-10-03 **Версия структуры:** 2.0 (docker-compose
файлы в `docker/` директории)
