# Docker Guide

## 🎯 Обзор

Руководство по использованию Docker для Avatar Generator.

## 🚀 Быстрый старт

### Docker (рекомендуется)

```bash
# Клонируйте репозиторий
git clone https://github.com/letnull19A/avatar-gen.git
cd avatar-gen

# Запустите все сервисы
docker compose -f docker/docker-compose.yml up -d

# Откройте в браузере
open https://localhost:12745
```

### Локальная установка

```bash
# Установите зависимости
pnpm install

# Запустите в dev режиме
pnpm run dev

# Откройте в браузере
open http://localhost:5173
```

## 🐳 Docker Compose конфигурации

### Базовая конфигурация

```yaml
# docker/docker-compose.yml
services:
  gateway:
    build: ./gateway
    ports:
      - '12745:12745' # HTTPS
    depends_on:
      - avatar-frontend
      - avatar-backend
    volumes:
      - ./gateway/configs:/etc/nginx/conf.d

  avatar-backend:
    build: ./backend
    expose:
      - '3000'
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/storage:/app/storage
      - ./backend/settings.yaml:/app/settings.yaml:ro

  avatar-frontend:
    build: ./frontend
    expose:
      - '8080'
    depends_on:
      - avatar-backend

  postgres:
    image: postgres:17-alpine
    profiles:
      - postgresql
    environment:
      POSTGRES_DB: avatar_gen
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
```

### Профили конфигурации

#### SQLite (по умолчанию)

```bash
# Запуск с SQLite (без PostgreSQL)
docker compose -f docker/docker-compose.yml up -d
```

**Особенности:**

- ✅ Быстрый запуск
- ✅ Не требует внешних сервисов
- ✅ Данные сохраняются в файле
- ❌ Не подходит для production

#### PostgreSQL

```bash
# Запуск с PostgreSQL
docker compose -f docker/docker-compose.yml --profile postgresql up -d
```

**Особенности:**

- ✅ Полноценная БД
- ✅ Подходит для production
- ✅ Масштабируемость
- ❌ Требует больше ресурсов

## 🛠️ Development конфигурации

### Development (docker-compose.dev.yml)

```bash
# Запуск в режиме разработки
docker compose -f docker/docker-compose.dev.yml up -d
```

**Профили:**

- `i-am-fullstack` - полный стек (backend + frontend + gateway)
- `i-am-frontender` - только frontend разработка
- `backend-dev` - только backend разработка
- `only-cloud` - только облачные сервисы (PostgreSQL + MinIO)

**Дополнительные сервисы:**

- **MinIO** - S3-совместимое хранилище для тестирования
- **PostgreSQL** - база данных для разработки

### Production (docker-compose.prod.yaml)

```bash
# Запуск в production режиме
docker compose -f docker/docker-compose.prod.yaml up -d
```

**Особенности:**

- Только необходимые сервисы
- Внешняя PostgreSQL (не в контейнере)
- S3 хранилище (не MinIO)
- Оптимизированные настройки

## 🚀 Использование

### Базовые команды

```bash
# Запуск всех сервисов
docker compose -f docker/docker-compose.yml up -d

# Запуск с PostgreSQL
docker compose -f docker/docker-compose.yml --profile postgresql up -d

# Просмотр логов
docker compose -f docker/docker-compose.yml logs -f

# Остановка
docker compose -f docker/docker-compose.yml down

# Остановка с удалением volumes
docker compose -f docker/docker-compose.yml down -v
```

### Development команды

```bash
# Полный стек для разработки
docker compose -f docker/docker-compose.dev.yml --profile i-am-fullstack up -d

# Только frontend разработка
docker compose -f docker/docker-compose.dev.yml --profile i-am-frontender up -d

# Только backend разработка
docker compose -f docker/docker-compose.dev.yml --profile backend-dev up -d

# Только облачные сервисы
docker compose -f docker/docker-compose.dev.yml --profile only-cloud up -d
```

### Production команды

```bash
# Production развертывание
docker compose -f docker/docker-compose.prod.yaml up -d

# С пересборкой образов
docker compose -f docker/docker-compose.prod.yaml up -d --build
```

## 🔧 Конфигурация

### Volumes

```yaml
volumes:
  postgres_data: # PostgreSQL данные
  certbot_data: # SSL сертификаты
  certbot_www: # Let's Encrypt веб-корень
  minio_data: # MinIO данные (dev)
```

### Networks

```yaml
networks:
  external: # Внешняя сеть (доступ извне)
  internal: # Внутренняя сеть (между сервисами)
  backend-db: # Сеть backend ↔ database
```

### Environment Variables

```bash
# Основные настройки
NODE_ENV=production
CONFIG_PATH=./settings.yaml

# PostgreSQL (для профиля postgresql)
POSTGRES_DB=avatar_gen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

## 📊 Мониторинг

### Health Checks

```bash
# Проверка состояния всех сервисов
docker compose -f docker/docker-compose.yml ps

# Проверка health check конкретного сервиса
docker inspect avatar-gen-backend | grep -A 10 Health
```

### Логи

```bash
# Все сервисы
docker compose -f docker/docker-compose.yml logs -f

# Конкретный сервис
docker compose -f docker/docker-compose.yml logs -f avatar-backend

# Последние 100 строк
docker compose -f docker/docker-compose.yml logs --tail=100
```

### Статистика ресурсов

```bash
# Использование CPU и памяти
docker stats

# Или через docker-compose
docker compose -f docker/docker-compose.yml top
```

## 🔧 Troubleshooting

### Проблема: Порты заняты

```bash
# Найдите процессы использующие порты
netstat -ano | findstr "3000"  # Windows
lsof -i :3000                   # Linux/Mac

# Остановите существующие контейнеры
docker compose -f docker/docker-compose.yml down
```

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker compose -f docker/docker-compose.yml logs

# Проверьте статус
docker compose -f docker/docker-compose.yml ps

# Пересоздайте контейнеры
docker compose -f docker/docker-compose.yml up -d --force-recreate
```

### Проблема: Нет доступа к volumes

```bash
# Дайте права на директории (Linux)
sudo chown -R $USER:$USER backend/storage backend/logs

# Или запустите с правильными правами
docker compose -f docker/docker-compose.yml run --user $(id -u):$(id -g) avatar-backend
```

## 🔒 Security

### Production Checklist

- [ ] Изменить пароль PostgreSQL
- [ ] Использовать Docker secrets для паролей
- [ ] Настроить HTTPS для gateway
- [ ] Ограничить доступ к портам (firewall)
- [ ] Использовать non-root пользователя в контейнерах
- [ ] Регулярно обновлять базовые образы

### Docker Secrets

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

## 📝 Полезные команды

```bash
# Проверка конфигурации
docker compose -f docker/docker-compose.yml config

# Валидация файла
docker compose -f docker/docker-compose.yml config --quiet

# Выполнить команду в контейнере
docker compose -f docker/docker-compose.yml exec avatar-backend sh

# Создать новый контейнер для выполнения команды
docker compose -f docker/docker-compose.yml run --rm avatar-backend npm run prisma:migrate

# Удалить все (контейнеры, сети, volumes)
docker compose -f docker/docker-compose.yml down -v --remove-orphans
```

## 🔗 Связанные документы

- [Docker Compose Configuration](DOCKER_COMPOSE.md)
- [Gateway Configuration](GATEWAY.md)
- [Scripts Documentation](SCRIPTS.md)

---

**Версия:** 3.1  
**Последнее обновление:** 2025-01-15  
**Автор:** Avatar Generator Team
