# GitHub Actions CI/CD Deployment

## Обзор

Проект использует GitHub Actions для автоматизации процессов сборки,
тестирования и развертывания на production сервер.

## Структура Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Запускается при:

- Pull Request в `main` или `develop`
- Push в ветки `develop`, `feature/**`, `fix/**`

Этапы:

1. **Lint Backend** - проверка кода backend на соответствие стандартам
2. **Lint Frontend** - проверка кода frontend на соответствие стандартам
3. **Test Backend** - запуск unit и e2e тестов backend
4. **Build Frontend** - сборка production версии frontend
5. **Docker Build Test** - тестовая сборка всех Docker образов

### 2. Production Deploy Workflow (`.github/workflows/deploy-prod.yml`)

Запускается при:

- Push в ветку `main`
- Ручной запуск через workflow_dispatch

Этапы:

1. **Test Backend** - полное тестирование backend
2. **Test Frontend** - проверка и сборка frontend
3. **Build Images** - сборка Docker образов
4. **Deploy** - развертывание на production сервер через SSH
5. **Verify** - проверка работоспособности после развертывания

## Настройка GitHub Secrets

Для работы CI/CD необходимо настроить следующие секреты в GitHub:

### Обязательные секреты

1. **SSH_HOST** - IP адрес или домен production сервера

   ```
   Пример: 123.45.67.89 или server.example.com
   ```

2. **SSH_PORT** - порт SSH сервера

   ```
   Пример: 22 или 2222
   ```

3. **SSH_USERNAME** - имя пользователя для SSH подключения

   ```
   Пример: deploy или ubuntu
   ```

4. **SSH_PRIVATE_KEY** - приватный SSH ключ для подключения

   ```
   Генерация:
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/avatar-gen-deploy

   Затем скопируйте содержимое ~/.ssh/avatar-gen-deploy (приватный ключ)
   И добавьте публичный ключ (~/.ssh/avatar-gen-deploy.pub) на сервер
   ```

5. **APP_PATH** - путь к приложению на сервере
   ```
   Пример: /opt/avatar-gen
   ```

### Настройка секретов в GitHub

1. Перейдите в Settings → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Добавьте каждый секрет с соответствующим значением

## Подготовка Production Сервера

### 1. Генерация SSH ключей

На локальной машине:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/avatar-gen-deploy
```

### 2. Добавление публичного ключа на сервер

```bash
ssh-copy-id -i ~/.ssh/avatar-gen-deploy.pub user@server.example.com
```

Или вручную:

```bash
# На сервере
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Вставьте содержимое avatar-gen-deploy.pub
chmod 600 ~/.ssh/authorized_keys
```

### 3. Установка необходимого ПО на сервере

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo apt install docker-compose-plugin

# Установка Git
sudo apt install git

# Перелогиниться для применения изменений в группах
newgrp docker
```

### 4. Клонирование репозитория на сервер

```bash
# Создание директории
sudo mkdir -p /opt/avatar-gen
sudo chown $USER:$USER /opt/avatar-gen

# Клонирование
cd /opt/avatar-gen
git clone https://github.com/your-username/avatar-gen.git .
```

### 5. Запуск скрипта настройки

```bash
cd /opt/avatar-gen
bash scripts/setup-production-server.sh /opt/avatar-gen
```

### 6. Редактирование конфигурации

```bash
nano backend/settings.production.local.yaml
```

Заполните реальными значениями:

- S3 credentials (если используется S3)
- Database password
- Другие конфиденциальные данные

### 7. Создание Docker сети

```bash
docker network create avatar-gen-external
```

### 8. Первый запуск

```bash
cd /opt/avatar-gen
docker compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up -d
```

## Процесс Автоматического Развертывания

После настройки, каждый push в `main` ветку будет:

1. ✅ Запускать тесты
2. ✅ Собирать Docker образы
3. ✅ Подключаться к серверу по SSH
4. ✅ Обновлять код (`git pull`)
5. ✅ Пересобирать образы
6. ✅ Перезапускать контейнеры
7. ✅ Проверять работоспособность
8. ✅ Очищать старые образы

## Локальные Конфигурационные Файлы

Важно! Файлы с конфиденциальными данными НЕ хранятся в git:

- `backend/settings.local.yaml` - локальная конфигурация
- `backend/settings.production.local.yaml` - production конфигурация с секретами
- `backend/settings.development.local.yaml` - development конфигурация

Эти файлы создаются на сервере вручную и остаются только на сервере.

## Порядок Загрузки Конфигурации

1. `settings.yaml` - базовая конфигурация (в git)
2. `settings.local.yaml` - локальные переопределения (НЕ в git)
3. `settings.{NODE_ENV}.yaml` - конфигурация окружения (в git)
4. `settings.{NODE_ENV}.local.yaml` - локальные переопределения окружения (НЕ в
   git)

## Ручной Запуск Deployment

Вы можете запустить deployment вручную через GitHub:

1. Перейдите в Actions → Deploy to Production
2. Нажмите "Run workflow"
3. Выберите ветку (обычно `main`)
4. Нажмите "Run workflow"

## Откат (Rollback)

Если развертывание прошло неудачно:

```bash
# На сервере
cd /opt/avatar-gen

# Откатиться на предыдущий коммит
git log --oneline -n 5  # посмотреть последние коммиты
git reset --hard <commit-hash>

# Пересобрать и перезапустить
docker compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql down
docker compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up -d --build
```

## Мониторинг

### Просмотр логов на сервере

```bash
# Логи всех контейнеров
docker compose -f docker/docker-compose.yml logs -f

# Логи конкретного сервиса
docker compose -f docker/docker-compose.yml logs -f avatar-backend
docker compose -f docker/docker-compose.yml logs -f avatar-frontend
docker compose -f docker/docker-compose.yml logs -f gateway

# Статус контейнеров
docker compose -f docker/docker-compose.yml ps
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend health (через gateway)
curl http://localhost:80/health

# Gateway health
curl http://localhost:80/
```

## Troubleshooting

### Проблема: SSH подключение не работает

```bash
# Проверьте SSH ключ локально
ssh -i ~/.ssh/avatar-gen-deploy user@server.example.com

# Проверьте права на сервере
ls -la ~/.ssh/authorized_keys  # должно быть 600
```

### Проблема: Docker контейнеры не запускаются

```bash
# Проверьте логи
docker compose -f docker/docker-compose.yml logs

# Проверьте конфигурацию
cat backend/settings.production.local.yaml

# Проверьте сеть
docker network ls | grep avatar-gen
```

### Проблема: Недостаточно места на диске

```bash
# Очистка старых образов
docker image prune -a

# Очистка старых контейнеров
docker container prune

# Очистка неиспользуемых volumes
docker volume prune
```

## Безопасность

1. ✅ SSH ключи защищены через GitHub Secrets
2. ✅ Конфигурационные файлы с секретами НЕ в git
3. ✅ Конфигурации монтируются как read-only в контейнеры
4. ✅ Используется dedicated SSH ключ только для deployment
5. ✅ Все чувствительные данные передаются через secrets

## Дополнительные Ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Конфигурация Local Settings](../../backend/docs/CONFIGURATION_LOCAL_SETTINGS.md)
- [Docker Compose Guide](./DOCKER_COMPOSE.md)

---

**Последнее обновление:** 2025-10-04
