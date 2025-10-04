# DevOps Integration Guide

Краткое руководство по интеграции и развертыванию Avatar Generator на production
сервере.

## Быстрый старт

### 1. Требования

- Ubuntu 20.04+ или аналогичная Linux система
- Docker 24.0+
- Docker Compose v2
- Git
- 2GB+ RAM
- 10GB+ свободного места на диске

### 2. Установка на сервере (5 минут)

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin

# Установка Git
sudo apt install git

# Перелогиниться
newgrp docker
```

### 3. Клонирование и настройка (3 минуты)

```bash
# Создание директории
sudo mkdir -p /opt/avatar-gen
sudo chown $USER:$USER /opt/avatar-gen

# Клонирование
cd /opt/avatar-gen
git clone https://github.com/your-username/avatar-gen.git .

# Запуск настройки
bash scripts/setup-production-server.sh /opt/avatar-gen
```

### 4. Конфигурация секретов (2 минуты)

```bash
# Редактирование production конфигурации
nano backend/settings.production.local.yaml
```

Замените placeholder значения:

- `YOUR_PRODUCTION_S3_ACCESS_KEY` → реальный S3 access key
- `YOUR_PRODUCTION_S3_SECRET_KEY` → реальный S3 secret key
- `CHANGE_THIS_PASSWORD` → пароль PostgreSQL базы данных
- `your-production-s3-endpoint.com` → адрес S3 хранилища
- `your-production-bucket` → имя S3 bucket

### 5. Запуск (1 минута)

```bash
cd /opt/avatar-gen
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql up -d
```

### 6. Проверка

```bash
# Проверка контейнеров
docker compose -f docker/docker-compose.yml ps

# Проверка health
curl http://localhost:3000/api/health
curl http://localhost:80/
```

## Архитектура

```
┌─────────────────────────────────────────────┐
│           Internet (Port 80, 443)           │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Nginx Gateway      │  (Port 80, 443)
        │  - SSL/TLS          │
        │  - Load Balancing   │
        └─────────┬───────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │ Frontend │    │  Backend   │  (Port 3000)
    │ (React)  │    │  (NestJS)  │
    └──────────┘    └─────┬──────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ┌─────▼────┐  ┌──▼─────┐
              │PostgreSQL│  │   S3   │
              │  (DB)    │  │(Storage)│
              └──────────┘  └────────┘
```

## Конфигурационные файлы

### В Git (публичные)

- `settings.yaml` - базовая конфигурация
- `settings.production.yaml` - production настройки (без секретов)
- `settings.development.yaml` - development настройки

### НЕ в Git (приватные)

- `settings.local.yaml` - локальные переопределения
- `settings.production.local.yaml` - **production секреты** ⚠️
- `settings.development.local.yaml` - development секреты

## GitHub Actions CI/CD

### Настройка GitHub Secrets

В Settings → Secrets and variables → Actions добавьте:

| Secret            | Описание           | Пример            |
| ----------------- | ------------------ | ----------------- |
| `SSH_HOST`        | IP/домен сервера   | `123.45.67.89`    |
| `SSH_PORT`        | SSH порт           | `22`              |
| `SSH_USERNAME`    | SSH пользователь   | `deploy`          |
| `SSH_PRIVATE_KEY` | SSH приватный ключ | `-----BEGIN...`   |
| `APP_PATH`        | Путь к приложению  | `/opt/avatar-gen` |

### Генерация SSH ключа

```bash
# Локально
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/avatar-gen-deploy

# Добавить публичный ключ на сервер
ssh-copy-id -i ~/.ssh/avatar-gen-deploy.pub user@server

# Скопировать приватный ключ в GitHub Secrets
cat ~/.ssh/avatar-gen-deploy
```

### Автоматическое развертывание

После настройки каждый push в `main` автоматически:

1. ✅ Запускает тесты
2. ✅ Собирает Docker образы
3. ✅ Подключается к серверу
4. ✅ Обновляет код
5. ✅ Перезапускает контейнеры
6. ✅ Проверяет health

## Мониторинг и логи

```bash
# Статус контейнеров
docker compose -f docker/docker-compose.yml ps

# Логи всех сервисов
docker compose -f docker/docker-compose.yml logs -f

# Логи конкретного сервиса
docker compose -f docker/docker-compose.yml logs -f avatar-backend

# Использование ресурсов
docker stats

# Проверка здоровья
curl http://localhost:3000/api/health
```

## Профили развертывания

### SQLite (для testing/staging)

```bash
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.sqlite.yml up -d
```

### PostgreSQL (для production)

```bash
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql up -d
```

### S3 Storage (для production)

```bash
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.s3.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql up -d
```

## Backup и восстановление

### База данных PostgreSQL

```bash
# Backup
docker exec avatar-gen-postgres pg_dump -U postgres avatar_gen > backup.sql

# Restore
docker exec -i avatar-gen-postgres psql -U postgres avatar_gen < backup.sql
```

### Local Storage (если используется)

```bash
# Backup
tar -czf storage-backup.tar.gz backend/storage/

# Restore
tar -xzf storage-backup.tar.gz
```

### S3 Storage

Уже имеет встроенную репликацию и backup на стороне S3 провайдера.

## Обновление приложения

### Автоматически (через GitHub Actions)

```bash
git push origin main
# GitHub Actions автоматически развернет на сервер
```

### Вручную на сервере

```bash
cd /opt/avatar-gen

# Обновить код
git pull origin main

# Пересобрать образы
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql build

# Перезапустить
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql up -d
```

## Масштабирование

### Горизонтальное (несколько инстансов backend)

```bash
# Запустить 3 инстанса backend
docker compose -f docker/docker-compose.yml \
  -f docker/docker-compose.postgresql.yml \
  --profile postgresql up -d --scale avatar-backend=3
```

Gateway автоматически распределит нагрузку.

### Вертикальное (больше ресурсов)

Отредактируйте `docker-compose.yml`:

```yaml
avatar-backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## Безопасность

### Checklist

- ✅ Firewall настроен (только 80, 443, SSH)
- ✅ SSH ключи вместо паролей
- ✅ Секреты в `*.local.yaml` файлах (не в git)
- ✅ PostgreSQL не доступен извне
- ✅ Backend не доступен напрямую (только через gateway)
- ✅ SSL сертификаты настроены (для HTTPS)
- ✅ Regular backups настроены

### Настройка Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker compose -f docker/docker-compose.yml logs avatar-backend

# Проверить конфигурацию
docker compose -f docker/docker-compose.yml config
```

### Проблемы с памятью

```bash
# Проверить использование
docker stats

# Очистить неиспользуемые ресурсы
docker system prune -a
```

### База данных не подключается

```bash
# Проверить PostgreSQL
docker exec avatar-gen-postgres pg_isready -U postgres

# Проверить логи PostgreSQL
docker logs avatar-gen-postgres
```

## Контакты и поддержка

- [GitHub Issues](https://github.com/your-username/avatar-gen/issues)
- [Full Documentation](../README.md)
- [GitHub Actions Setup](./GITHUB_ACTIONS_DEPLOYMENT.md)

---

**Время на полную настройку:** ~15 минут  
**Последнее обновление:** 2025-10-04
