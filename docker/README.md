# Docker Configuration

Директория содержит Docker конфигурацию для проекта Avatar Generator с
использованием **профилей Docker Compose**.

## 📁 Структура

```
docker/
├── docker-compose.yml           # Развёртывание и разработка (SQLite/PostgreSQL + Local/S3)
├── docker-compose.prod.yaml     # Production конфигурация (PostgreSQL + S3)
└── README.md                    # Эта документация

Dockerfile остаются в своих модулях:
backend/docker/
├── Dockerfile                   # Dockerfile для backend (NestJS)
└── README.md                    # Документация backend образа

frontend/docker/
└── Dockerfile                   # Dockerfile для frontend (React + Nginx)

gateway/
└── Dockerfile                   # Dockerfile для Nginx Gateway
```

## 🎯 Профили Docker Compose

Начиная с версии 3.0, проект использует **единый файл docker-compose.yml** с
профилями вместо множества отдельных файлов.

### Доступные конфигурации

- **default** (без профиля) - SQLite + Local Storage
- **postgresql** (профиль) - PostgreSQL Database в контейнере (для
  разработки/тестирования)
- **postgresql-external** - Внешняя PostgreSQL Database (для продакшена)
- **s3** - S3 Storage (через переменные окружения)

### Когда использовать контейнер PostgreSQL vs внешнюю БД

**Контейнер PostgreSQL** (`--profile postgresql`):

- ✅ Локальная разработка
- ✅ Тестирование
- ✅ CI/CD pipelines
- ❌ НЕ для продакшена

**Внешняя PostgreSQL**:

- ✅ Продакшен (управляемая БД: AWS RDS, Azure Database, etc.)
- ✅ Staging окружение с готовой БД
- ✅ Любой случай, когда БД уже существует

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
docker-compose -f docker/docker-compose.yml up

# Или используйте скрипт
./scripts/start.sh
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

### Запуск с PostgreSQL (контейнер для разработки/тестирования)

```bash
# Используя Docker Compose напрямую
docker-compose -f docker/docker-compose.yml --profile postgresql up

# Или используйте скрипт (рекомендуется)
./scripts/start.sh --db postgresql
```

**Что происходит:**

- Запускается сервис `postgres` (контейнер PostgreSQL 17 Alpine)
- Backend настраивается на подключение к контейнеру
- DATABASE_PROVIDER автоматически устанавливается в `postgresql`
- **Использование:** локальная разработка, тестирование, CI/CD

### Запуск с внешней PostgreSQL (продакшен)

```bash
# Установите URL вашей внешней БД
export DATABASE_URL=postgresql://user:password@your-db-host:5432/avatar_gen

# Запустите без контейнера postgres
./scripts/start.sh --db postgresql-external

# Или напрямую через docker-compose
DATABASE_PROVIDER=postgresql \
DATABASE_URL=postgresql://user:password@your-db-host:5432/avatar_gen \
docker-compose -f docker/docker-compose.yml up
```

**Что происходит:**

- Контейнер PostgreSQL НЕ запускается
- Backend подключается к вашей внешней БД
- Используется для продакшена с управляемыми БД (AWS RDS, Azure, etc.)

**Примеры внешних БД:**

```bash
# AWS RDS
export DATABASE_URL=postgresql://admin:secret@mydb.abc123.us-east-1.rds.amazonaws.com:5432/avatar_gen

# Azure Database for PostgreSQL
export DATABASE_URL=postgresql://admin@myserver:secret@myserver.postgres.database.azure.com:5432/avatar_gen

# Google Cloud SQL
export DATABASE_URL=postgresql://user:pass@/avatar_gen?host=/cloudsql/project:region:instance

# Собственный сервер
export DATABASE_URL=postgresql://dbuser:dbpass@192.168.1.100:5432/avatar_gen
```

### Запуск с S3 хранилищем

```bash
# Установите переменные окружения для S3
export S3_ENDPOINT=https://s3.example.com
export S3_BUCKET=my-bucket
export S3_ACCESS_KEY=xxx
export S3_SECRET_KEY=yyy

# Запустите с S3 storage
./scripts/start.sh --storage s3
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

### Комбинированный запуск (PostgreSQL + S3)

```bash
# Установите S3 credentials
export S3_ENDPOINT=https://s3.example.com
export S3_BUCKET=my-bucket
export S3_ACCESS_KEY=xxx
export S3_SECRET_KEY=yyy

# Запустите с обоими профилями
./scripts/start.sh --db postgresql --storage s3
```

### Сборка образов

```bash
# Используйте скрипты для удобства
./scripts/build.sh sqlite
./scripts/build.sh postgresql

# Или напрямую
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml --profile postgresql build
```

## 📋 Управление конфигурацией

### Переменные окружения

Backend настраивается через следующие переменные окружения:

| Переменная          | Значение по умолчанию                     | Описание                           |
| ------------------- | ----------------------------------------- | ---------------------------------- |
| `DATABASE_PROVIDER` | `sqlite`                                  | Тип БД: `sqlite` или `postgresql`  |
| `DATABASE_URL`      | `file:./storage/database/database.sqlite` | Строка подключения к БД            |
| `STORAGE_TYPE`      | `local`                                   | Тип хранилища: `local` или `s3`    |
| `S3_ENDPOINT`       | -                                         | Endpoint S3-совместимого хранилища |
| `S3_BUCKET`         | -                                         | Имя bucket для хранения файлов     |
| `S3_ACCESS_KEY`     | -                                         | Access key для S3                  |
| `S3_SECRET_KEY`     | -                                         | Secret key для S3                  |
| `S3_REGION`         | `us-east-1`                               | Регион S3                          |

**Примечание:** При использовании внешней PostgreSQL просто установите
`DATABASE_URL` на вашу БД, контейнер postgres запускаться не будет.

### Ручное управление через docker-compose

```bash
# SQLite + Local Storage (default)
docker-compose -f docker/docker-compose.yml up

# PostgreSQL (контейнер) + Local Storage - для разработки
DATABASE_PROVIDER=postgresql \
DATABASE_URL=postgresql://postgres:password@postgres:5432/avatar_gen \
docker-compose -f docker/docker-compose.yml --profile postgresql up

# PostgreSQL (внешняя) + Local Storage - для продакшена
DATABASE_PROVIDER=postgresql \
DATABASE_URL=postgresql://user:password@external-db-host:5432/avatar_gen \
docker-compose -f docker/docker-compose.yml up

# SQLite + S3 Storage
STORAGE_TYPE=s3 \
S3_ENDPOINT=https://s3.example.com \
S3_BUCKET=my-bucket \
S3_ACCESS_KEY=xxx \
S3_SECRET_KEY=yyy \
docker-compose -f docker/docker-compose.yml up

# PostgreSQL (внешняя) + S3 Storage - типичный продакшен
DATABASE_PROVIDER=postgresql \
DATABASE_URL=postgresql://user:password@external-db-host:5432/avatar_gen \
STORAGE_TYPE=s3 \
S3_ENDPOINT=https://s3.example.com \
S3_BUCKET=my-bucket \
S3_ACCESS_KEY=xxx \
S3_SECRET_KEY=yyy \
docker-compose -f docker/docker-compose.yml up
```

## 🐳 Сервисы

### Gateway (Nginx Reverse Proxy)

- **Запускается:** Всегда
- **Порты:** 80 (HTTP), 12745 (HTTPS)
- **Назначение:** Прокси-сервер для frontend и backend

### Avatar Backend

- **Запускается:** Всегда
- **Порт:** 3000 (внутренний)
- **Конфигурация:** Через переменные окружения
- **Health check:** `http://localhost:3000/api/health`

### Avatar Frontend

- **Запускается:** Всегда
- **Порт:** 8080 (внутренний)
- **Health check:** `http://localhost:8080/health`

### PostgreSQL

- **Запускается:** Только с профилем `postgresql`
- **Порт:** 5432
- **Версия:** PostgreSQL 17 Alpine
- **Health check:** `pg_isready -U postgres -d avatar_gen`

## 🔧 Dockerfiles

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

- **80** - Gateway (HTTP)
- **12745** - Gateway (HTTPS)
- **3000** - Backend API (внутренний)
- **8080** - Frontend (внутренний)
- **5432** - PostgreSQL (только для PostgreSQL профиля)

### Сети

- **external** - Внешняя сеть для gateway (доступ к интернету)
- **internal** - Внутренняя сеть для gateway, backend и frontend
- **backend-db** - Изолированная сеть для backend и базы данных

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
- При работе с внешними S3 сервисами требуется DNS резолвинг
- Без явно указанных DNS серверов может возникать ошибка `EAI_AGAIN`

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
curl -f http://localhost:8080/health
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

## 🌟 Типичные сценарии использования

### Разработка / Тестирование

```bash
# Все в контейнерах, легко запустить и удалить
./scripts/start.sh --db postgresql

# Или с S3 для тестирования
./scripts/start.sh --db postgresql --storage s3
```

### Продакшен

```bash
# Внешние управляемые сервисы
export DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/avatar_gen
export S3_ENDPOINT=https://s3.amazonaws.com
export S3_BUCKET=prod-avatars
export S3_ACCESS_KEY=xxx
export S3_SECRET_KEY=yyy

./scripts/start.sh --db postgresql-external --storage s3
```

### CI/CD Pipeline

```yaml
# GitHub Actions / GitLab CI пример
services:
  postgres:
    image: postgres:17-alpine
    env:
      POSTGRES_DB: avatar_gen_test
      POSTGRES_PASSWORD: test

env:
  DATABASE_URL: postgresql://postgres:test@postgres:5432/avatar_gen_test

run: |
  docker-compose --profile postgresql up -d
  npm test
```

## 📝 Примечания

1. **Единый файл конфигурации** - все настройки в `docker-compose.yml`
2. **Профиль postgresql только для контейнера** - внешняя БД работает без
   профиля
3. **Управление через переменные окружения** - гибкая настройка без дублирования
   файлов
4. **Dockerfile пути** - указывают на файлы в `backend/docker/` и
   `frontend/docker/`
5. **Конфигурации монтируются извне:**
   - ✅ Конфигурационные файлы НЕ включаются в образ
   - ✅ Монтируются как volumes при запуске контейнера
   - ✅ Можно изменять без пересборки образа
   - ✅ Используется read-only режим для безопасности
6. **PostgreSQL контейнер vs внешняя:**
   - ✅ Контейнер: разработка, тестирование, CI/CD
   - ✅ Внешняя: продакшен, staging с готовой БД

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

# 3. Запустите с S3 через переменные окружения
./scripts/start.sh --storage s3
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

**Решение:** DNS серверы уже настроены в `docker-compose.yml`. Если проблема
сохраняется:

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

**Решение:** Убедитесь что переменная окружения `STORAGE_TYPE=s3` установлена,
или в `settings.yaml`:

```yaml
app:
  storage:
    type: 's3' # НЕ 'local'
    s3:
      # ... S3 конфигурация
```

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
- [Скрипты управления](../docs/deployment/SCRIPTS.md)
- [Исправления сборки](./DOCKER_BUILD_FIXES.md)

## 🔄 Миграция с версии 2.x

Если вы использовали предыдущую версию с множественными docker-compose файлами:

**Было:**

```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml up
```

**Стало:**

```bash
docker-compose -f docker/docker-compose.yml --profile postgresql up
# или
./scripts/start.sh --db postgresql
```

**Преимущества новой структуры:**

- ✅ Один файл вместо четырех
- ✅ Меньше дублирования конфигурации
- ✅ Проще управление через профили
- ✅ Гибкая комбинация опций через переменные окружения

---

**Последнее обновление:** 2025-10-05 **Версия структуры:** 3.0 (единый
docker-compose.yml с профилями) **Issue:**
[#17 - Docker Compose профили](https://github.com/Black-Cat-OSS/avatar-gen/issues/17)
