# Локальные конфигурационные файлы

## Обзор

Система конфигурации backend поддерживает локальные файлы настроек, которые позволяют переопределять конфиденциальные данные без их коммита в git репозиторий.

## Порядок загрузки конфигурации

Конфигурация загружается в следующем порядке (каждый последующий файл переопределяет предыдущий):

1. `settings.yaml` - базовая конфигурация
2. `settings.local.yaml` - локальная конфигурация (НЕ в git)
3. `settings.{NODE_ENV}.yaml` - среда-специфичная конфигурация
4. `settings.{NODE_ENV}.local.yaml` - локальная среда-специфичная конфигурация (НЕ в git)

## Примеры файлов

### settings.local.yaml

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.local.sqlite'
  logging:
    level: 'debug'
    verbose: true
    pretty: true
```

### settings.production.local.yaml

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-production-s3-endpoint.com'
      bucket: 'your-production-bucket'
      access_key: 'YOUR_PRODUCTION_S3_ACCESS_KEY'
      secret_key: 'YOUR_PRODUCTION_S3_SECRET_KEY'
      region: 'us-east-1'
      force_path_style: true
  database:
    driver: 'postgresql'
    # Рекомендуется использовать прямой URL для production
    postgresql_params:
      url: 'postgresql://username:password@host:port/database'
    # Дополнительные параметры (опционально)
    network:
      host: 'your-production-db-host'
      port: 5432
      database: 'avatar_gen_production'
      username: 'your-production-db-user'
      password: 'your-production-db-password'
      ssl: true
  logging:
    level: 'warn'
    verbose: false
    pretty: false
```

## Настройка для разработки

1. Скопируйте пример файла:
   ```bash
   cp backend/settings.local.yaml.example backend/settings.local.yaml
   ```

2. Отредактируйте файл под ваши нужды:
   ```bash
   nano backend/settings.local.yaml
   ```

3. Убедитесь, что файл добавлен в .gitignore (уже настроено)

## Настройка для production

1. На сервере создайте файл:
   ```bash
   nano backend/settings.production.local.yaml
   ```

2. Заполните конфиденциальными данными:
   - S3 ключи доступа
   - Пароли базы данных
   - Другие секретные настройки

3. Убедитесь, что файл не попадет в git

## Docker интеграция

### По умолчанию

Docker Compose НЕ монтирует локальные конфигурационные файлы (`*.local.*.yaml`), чтобы избежать создания директорий вместо файлов, если они отсутствуют.

По умолчанию монтируются только основные файлы:

```yaml
volumes:
  - ../backend/settings.yaml:/app/settings.yaml:ro
  - ../backend/settings.production.yaml:/app/settings.production.yaml:ro
```

### Монтирование локальных файлов (опционально)

Если вам нужны локальные конфигурационные файлы в Docker, создайте `docker/docker-compose.override.yml`:

```yaml
services:
  avatar-backend:
    volumes:
      - ../backend/settings.local.yaml:/app/settings.local.yaml:ro
      - ../backend/settings.production.local.yaml:/app/settings.production.local.yaml:ro
```

**Важно:** Создайте файлы перед запуском Docker Compose, иначе Docker создаст директории вместо файлов:

```bash
touch backend/settings.local.yaml
touch backend/settings.production.local.yaml
docker compose up
```

## Безопасность

- Локальные файлы настроек НЕ коммитятся в git
- Файлы монтируются как read-only в Docker контейнеры
- Конфиденциальные данные остаются на сервере

## Примеры использования

### Локальная разработка с SQLite

```yaml
# settings.local.yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.local.sqlite'
```

### Production с PostgreSQL и S3

```yaml
# settings.production.local.yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3-endpoint.com'
      bucket: 'your-bucket'
      access_key: 'REAL_ACCESS_KEY'
      secret_key: 'REAL_SECRET_KEY'
      region: 'us-east-1'
      force_path_style: true
  database:
    driver: 'postgresql'
    postgresql_params:
      url: 'postgresql://user:REAL_DB_PASSWORD@prod-db-host:5432/database'
  logging:
    level: 'warn'
    verbose: false
    pretty: false
```

## Отладка

Для отладки загрузки конфигурации включите debug логирование:

```yaml
app:
  logging:
    level: 'debug'
    verbose: true
```

В логах вы увидите порядок загрузки файлов и результат их слияния.
