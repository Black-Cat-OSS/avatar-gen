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

### Запуск с SQLite (по умолчанию)

```bash
# Из корня проекта
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up

# Или используйте скрипты
./scripts/start.sh sqlite
```

### Запуск с PostgreSQL

```bash
# Из корня проекта
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up

# Или используйте скрипты
./scripts/start.sh postgresql
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

- `../backend/storage:/app/storage` - Хранилище аватаров и SQLite БД
- `../backend/settings.yaml:/app/settings.yaml` - Конфигурация
- `../backend/logs:/app/logs` - Логи приложения

### Frontend

- `../frontend/logs:/var/log/nginx` - Логи Nginx

### PostgreSQL

- `postgres_data` - Данные PostgreSQL (Docker volume)

## 🌐 Порты

- **80** - Frontend (HTTP)
- **443** - Frontend (HTTPS)
- **3000** - Backend API
- **5432** - PostgreSQL (только для PostgreSQL профиля)

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

## 📚 Дополнительная документация

- [Backend Dockerfile](../backend/docker/README.md)
- [Общая документация Docker Compose](../docs/DOCKER_COMPOSE_README.md)
- [Скрипты управления](../scripts/README.md)
- [Исправления сборки](./DOCKER_BUILD_FIXES.md)

---

**Последнее обновление:** 2025-10-03 **Версия структуры:** 2.0 (docker-compose
файлы в `docker/` директории)
