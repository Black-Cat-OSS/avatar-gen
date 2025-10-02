# Docker Compose Configuration

Конфигурация Docker Compose для полного запуска проекта Avatar Generation.

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────┐
│           avatar-gen-network (bridge)           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐│
│  │   Frontend   │  │   Backend    │  │Postgre││
│  │   (Nginx)    │→ │   (NestJS)   │→ │  SQL  ││
│  │   :80, :443  │  │    :3000     │  │ :5432 ││
│  └──────────────┘  └──────────────┘  └───────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

## 📦 Сервисы

### 1. PostgreSQL (`postgres`)

**Образ:** `postgres:15-alpine`  
**Порт:** `5432`  
**Назначение:** База данных (опциональная, можно использовать SQLite)

**Конфигурация:**

- База данных: `avatar_gen`
- Пользователь: `postgres`
- Пароль: `password` (⚠️ изменить для production)
- Encoding: UTF-8

**Volumes:**

- `postgres_data:/var/lib/postgresql/data` - Персистентное хранение данных
- `./backend/init-scripts:/docker-entrypoint-initdb.d` - Скрипты инициализации

**Health Check:**

```yaml
test: ['CMD-SHELL', 'pg_isready -U postgres -d avatar_gen']
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

### 2. Backend (`avatar-backend`)

**Build Context:** `./backend`  
**Dockerfile:** `backend/docker/Dockerfile`  
**Порт:** `3000`  
**Назначение:** NestJS API сервер

**Volumes:**

- `./backend/storage:/app/storage` - Хранение сгенерированных аватаров
- `./backend/prisma/storage:/app/prisma/storage` - SQLite БД (если используется)
- `./backend/settings.yaml:/app/settings.yaml` - Конфигурация
- `./backend/logs:/app/logs` - Логи приложения

**Environment:**

- `NODE_ENV=production`
- `DATABASE_PROVIDER=sqlite` (или `postgresql`)
- `DATABASE_URL` - URL подключения к БД
- `CONFIG_PATH=./settings.yaml`

**Health Check:**

```yaml
test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
interval: 30s
timeout: 10s
retries: 3
start_period: 40s
```

### 3. Frontend (`avatar-frontend`)

**Build Context:** `./frontend`  
**Dockerfile:** `frontend/docker/Dockerfile`  
**Порты:** `80`, `443`  
**Назначение:** Nginx веб-сервер с React SPA

**Volumes:**

- `./frontend/logs:/var/log/nginx` - Nginx логи

**Health Check:**

```yaml
test: ['CMD', 'curl', '-f', 'http://localhost/health']
interval: 30s
timeout: 10s
retries: 3
start_period: 10s
```

## 🚀 Использование

### Профили конфигурации

Проект поддерживает два профиля для разных баз данных:

#### Профиль SQLite (по умолчанию)

Используется для разработки и простых сценариев без PostgreSQL.

```bash
# Запустить с профилем SQLite
docker-compose --profile sqlite up -d

# Или просто (профиль sqlite активен по умолчанию)
docker-compose up -d
```

#### Профиль PostgreSQL

Используется для production окружения с полноценной PostgreSQL базой данных.

```bash
# Запустить с профилем PostgreSQL
docker-compose --profile postgresql up -d
```

### Быстрый старт

```bash
# Запустить все сервисы (профиль sqlite по умолчанию)
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes
docker-compose down -v
```

### Запуск отдельных сервисов

```bash
# Только backend с SQLite
docker-compose --profile sqlite up avatar-backend

# Только backend с PostgreSQL
docker-compose --profile postgresql up avatar-backend

# Только frontend
docker-compose up avatar-frontend

# PostgreSQL отдельно (только для профиля postgresql)
docker-compose --profile postgresql up postgres
```

### Пересборка образов

```bash
# Пересобрать все сервисы
docker-compose build

# Пересобрать конкретный сервис
docker-compose build avatar-backend

# Пересобрать и запустить
docker-compose up --build
```

## ⚙️ Конфигурация

### Профили баз данных

Проект использует профили для автоматической настройки базы данных:

#### Профиль SQLite (по умолчанию)

- Используется для разработки
- Не требует дополнительной настройки
- База данных хранится в файле

#### Профиль PostgreSQL

- Используется для production
- Требует настройки PostgreSQL сервиса

### Настройка settings.yaml

Убедитесь, что ваш `backend/settings.yaml` соответствует выбранному профилю:

```yaml
app:
  database:
    driver: 'sqlite' # для профиля sqlite
    # driver: 'postgresql'  # для профиля postgresql (раскомментируйте)
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
    # postgresql_params:     # раскомментируйте для PostgreSQL
    #   host: "postgres"
    #   port: 5432
    #   database: "avatar_gen"
    #   username: "postgres"
    #   password: "password"
    #   ssl: false
```

### Переключение между профилями

```bash
# Использовать SQLite (по умолчанию)
docker-compose --profile sqlite up -d

# Использовать PostgreSQL
docker-compose --profile postgresql up -d
```

### Миграции базы данных

Для каждого профиля выполняйте миграции отдельно:

```bash
# Миграция для SQLite
docker-compose --profile sqlite run --rm avatar-backend npm run prisma:migrate

# Миграция для PostgreSQL
docker-compose --profile postgresql run --rm avatar-backend npm run prisma:migrate
```

### Изменение портов

```yaml
# В docker-compose.yml
services:
  avatar-backend:
    ports:
      - '8080:3000' # Host:Container

  avatar-frontend:
    ports:
      - '8000:80' # HTTP
      - '8443:443' # HTTPS
```

### Настройка ресурсов

Добавьте ограничения ресурсов (для production):

```yaml
services:
  avatar-backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 🔧 Работа с volumes

### Список volumes

```bash
# Посмотреть все volumes
docker volume ls

# Информация о конкретном volume
docker volume inspect avatar-gen_postgres_data
```

### Backup PostgreSQL

```bash
# Создать backup
docker-compose exec postgres pg_dump -U postgres avatar_gen > backup.sql

# Восстановить backup
docker-compose exec -T postgres psql -U postgres avatar_gen < backup.sql
```

### Backup SQLite

```bash
# Просто скопировать файл
cp backend/storage/database/database.sqlite backend/backups/database_$(date +%Y%m%d).sqlite
```

## 🐛 Troubleshooting

### Проблема: Сервис не запускается

```bash
# Просмотр логов
docker-compose logs avatar-backend

# Проверка статуса
docker-compose ps

# Рестарт сервиса
docker-compose restart avatar-backend
```

### Проблема: Backend не может подключиться к PostgreSQL

**Симптомы:**

```
Error: Can't reach database server at postgres:5432
```

**Решение:**

1. Проверьте, что PostgreSQL запущен:

```bash
docker-compose ps postgres
```

2. Проверьте health check:

```bash
docker-compose exec postgres pg_isready -U postgres
```

3. Проверьте переменные окружения:

```bash
docker-compose config | grep DATABASE_URL
```

### Проблема: Порты заняты

**Симптомы:**

```
Error: bind: address already in use
```

**Решение:**

1. Найдите процесс, использующий порт:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

2. Измените порт в docker-compose.yml:

```yaml
ports:
  - '3001:3000' # Использовать 3001 вместо 3000
```

### Проблема: Контейнеры постоянно перезапускаются

```bash
# Проверьте health check
docker inspect avatar-gen-backend | grep -A 10 Health

# Отключите restart для отладки
docker-compose up --no-start
docker-compose start avatar-backend
docker-compose logs -f avatar-backend
```

### Проблема: Нет доступа к volumes

**Симптомы:**

```
Error: EACCES: permission denied
```

**Решение (Linux):**

```bash
# Дать права текущему пользователю
sudo chown -R $USER:$USER backend/storage backend/prisma/storage

# Или запустить контейнер от текущего пользователя
docker-compose run --user $(id -u):$(id -g) avatar-backend
```

## 🔒 Security

### Production Checklist

- [ ] Изменить пароль PostgreSQL
- [ ] Использовать Docker secrets для паролей
- [ ] Настроить HTTPS для frontend
- [ ] Ограничить доступ к портам (firewall)
- [ ] Использовать non-root пользователя в контейнерах
- [ ] Регулярно обновлять базовые образы
- [ ] Сканировать образы на уязвимости

### Использование Docker Secrets

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## 📊 Мониторинг

### Просмотр логов всех сервисов

```bash
# Все сервисы
docker-compose logs

# С отслеживанием
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f avatar-backend

# Последние 100 строк
docker-compose logs --tail=100
```

### Статистика ресурсов

```bash
# Использование CPU и памяти
docker stats

# Или через docker-compose
docker-compose top
```

### Health Check Status

```bash
# Статус всех контейнеров
docker-compose ps

# Детальная информация о health check
docker inspect --format='{{json .State.Health}}' avatar-gen-backend | jq
```

## 🚀 Production Deployment

### Рекомендации

1. **Используйте конкретные версии образов**

   ```yaml
   image: postgres:15.4-alpine # Не :latest
   ```

2. **Настройте логирование**

   ```yaml
   logging:
     driver: 'json-file'
     options:
       max-size: '10m'
       max-file: '3'
   ```

3. **Используйте restart policy**

   ```yaml
   restart: unless-stopped # Или on-failure:3
   ```

4. **Настройте мониторинг**
   - Prometheus + Grafana
   - ELK Stack
   - Cloud monitoring (AWS CloudWatch, etc.)

5. **Backup стратегия**
   - Регулярные backups PostgreSQL
   - Репликация volumes
   - Offsite backups

### Пример production конфигурации

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15.4-alpine
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G

  avatar-backend:
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '5'
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
      replicas: 2 # Для load balancing
```

## 📝 Полезные команды

```bash
# Проверка конфигурации
docker-compose config

# Валидация файла
docker-compose config --quiet

# Список запущенных контейнеров
docker-compose ps

# Список всех контейнеров (включая остановленные)
docker-compose ps -a

# Выполнить команду в контейнере
docker-compose exec avatar-backend sh

# Создать новый контейнер для выполнения команды
docker-compose run --rm avatar-backend npm run prisma:migrate

# Пересоздать контейнеры
docker-compose up --force-recreate

# Удалить все (контейнеры, сети, volumes)
docker-compose down -v --remove-orphans
```

## 🔗 Связанные документы

- [Backend Dockerfile](./backend/docker/README.md)
- [Frontend Dockerfile](./frontend/docker/README.md) (TODO)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

**Последнее обновление:** 2025-10-01  
**Версия:** 1.1.0
