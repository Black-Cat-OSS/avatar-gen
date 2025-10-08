# Настройка GitHub Secrets для тестирования

**Дата создания:** 2025-10-04  
**Версия:** 1.0

## 📋 Обзор

Данный документ описывает настройку GitHub Secrets для использования реальных S3
credentials в тестах CI/CD pipeline.

## 🔐 GitHub Secrets для тестирования

### Основные секреты

| Secret Name          | Описание                      | Пример                                     |
| -------------------- | ----------------------------- | ------------------------------------------ |
| `TEST_S3_ENDPOINT`   | Endpoint тестового S3 сервера | `https://s3.amazonaws.com`                 |
| `TEST_S3_BUCKET`     | Название тестового бакета     | `avatar-gen-test`                          |
| `TEST_S3_ACCESS_KEY` | Access Key для S3             | `AKIAIOSFODNN7EXAMPLE`                     |
| `TEST_S3_SECRET_KEY` | Secret Key для S3             | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `TEST_S3_REGION`     | Регион S3                     | `us-east-1`                                |

### Секреты для production

#### SSH и деплой

| Secret Name       | Описание                     | Пример                |
| ----------------- | ---------------------------- | --------------------- |
| `SSH_HOST`        | IP адрес production сервера  | `192.168.1.100`       |
| `SSH_PORT`        | SSH порт (обычно 22)         | `22`                  |
| `SSH_PRIVATE_KEY` | Приватный SSH ключ           | `-----BEGIN RSA...`   |
| `SSH_USERNAME`    | Имя пользователя SSH         | `deploy`              |
| `APP_PATH`        | Путь к приложению на сервере | `/var/www/avatar-gen` |

#### Production S3 Storage

| Secret Name          | Описание                 | Пример                                     |
| -------------------- | ------------------------ | ------------------------------------------ |
| `PROD_S3_ENDPOINT`   | Production S3 endpoint   | `https://s3.amazonaws.com`                 |
| `PROD_S3_BUCKET`     | Production S3 bucket     | `avatar-gen-production`                    |
| `PROD_S3_ACCESS_KEY` | Production S3 Access Key | `AKIAIOSFODNN7EXAMPLE`                     |
| `PROD_S3_SECRET_KEY` | Production S3 Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `PROD_S3_REGION`     | Production S3 region     | `us-east-1`                                |

#### Production PostgreSQL Database

| Secret Name        | Описание          | Пример              |
| ------------------ | ----------------- | ------------------- |
| `PROD_DB_HOST`     | PostgreSQL host   | `db.example.com`    |
| `PROD_DB_PORT`     | PostgreSQL port   | `5432`              |
| `PROD_DB_NAME`     | Database name     | `avatar_gen_prod`   |
| `PROD_DB_USERNAME` | Database username | `avatar_user`       |
| `PROD_DB_PASSWORD` | Database password | `SecurePassword123` |

## 🛠️ Настройка секретов в GitHub

### 1. Перейдите в настройки репозитория

1. Откройте ваш репозиторий на GitHub
2. Перейдите в `Settings` → `Secrets and variables` → `Actions`
3. Нажмите `New repository secret`

### 2. Добавьте каждый секрет

Для каждого секрета:

1. **Name**: Введите имя секрета (например, `TEST_S3_ENDPOINT`)
2. **Secret**: Введите значение секрета
3. Нажмите `Add secret`

### 3. Проверьте список секретов

Убедитесь, что все секреты добавлены:

#### Тестовые секреты (опционально)

```
✅ TEST_S3_ENDPOINT
✅ TEST_S3_BUCKET
✅ TEST_S3_ACCESS_KEY
✅ TEST_S3_SECRET_KEY
✅ TEST_S3_REGION
```

#### Production секреты (обязательно)

```
✅ SSH_HOST
✅ SSH_PORT
✅ SSH_PRIVATE_KEY
✅ SSH_USERNAME
✅ APP_PATH
✅ PROD_S3_ENDPOINT
✅ PROD_S3_BUCKET
✅ PROD_S3_ACCESS_KEY
✅ PROD_S3_SECRET_KEY
✅ PROD_S3_REGION
✅ PROD_DB_HOST
✅ PROD_DB_PORT
✅ PROD_DB_NAME
✅ PROD_DB_USERNAME
✅ PROD_DB_PASSWORD
```

## 🔧 Варианты настройки тестов

### Вариант 1: Использование GitHub Secrets

Workflows автоматически используют секреты, если они настроены:

```yaml
# В .github/workflows/ci.yml
s3:
  endpoint: '${{ secrets.TEST_S3_ENDPOINT || 'https://test-s3-endpoint.com' }}'
  bucket: '${{ secrets.TEST_S3_BUCKET || 'avatar-gen-test' }}'
  access_key: '${{ secrets.TEST_S3_ACCESS_KEY || 'test-access-key' }}'
  secret_key: '${{ secrets.TEST_S3_SECRET_KEY || 'test-secret-key' }}'
```

### Вариант 2: Локальный файл настроек

Создайте файл `backend/settings.test.yaml` в репозитории:

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-test-s3-endpoint.com'
      bucket: 'your-test-bucket'
      access_key: 'your-test-access-key'
      secret_key: 'your-test-secret-key'
      region: 'us-east-1'
      force_path_style: true
```

Затем используйте workflow `test-with-local-config.yml` с параметром
`use_local_config: true`.

### Вариант 3: Ручная настройка

Создайте файл `backend/settings.test.yaml` с нужными настройками:

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3.com'
      bucket: 'your-bucket'
      access_key: '${TEST_S3_ACCESS_KEY}'
      secret_key: '${TEST_S3_SECRET_KEY}'
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/test-database/database.test.sqlite'
```

Запуск тестов:

```bash
NODE_ENV=test pnpm run test
```

## 🧪 Тестирование настроек

### Проверка локально

1. **Сгенерируйте конфигурацию:**

   ```bash
   # Создайте файл backend/settings.test.yaml с нужными настройками
   ```

2. **Установите переменные окружения:**

   ```bash
   export TEST_S3_ACCESS_KEY=your-key
   export TEST_S3_SECRET_KEY=your-secret
   export TEST_S3_REGION=your-region
   ```

3. **Запустите тесты:**
   ```bash
   NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test
   ```

### Проверка в CI/CD

1. **Автоматический запуск (быстрые тесты):**
   - Создайте Pull Request
   - Тесты запустятся автоматически с SQLite + Local/S3
   - Используются GitHub Secrets для S3 (если настроены)

2. **Ручной запуск с полным матричным тестированием:**
   - Перейдите в `Actions` → `CI`
   - Нажмите `Run workflow`
   - Установите `run_full_matrix: true` для тестов с PostgreSQL
   - Установите `use_custom_s3: true` для использования ваших S3 credentials

3. **Production Deploy:**
   - Push в `main` ветку автоматически запустит деплой
   - Сначала запустятся быстрые тесты, затем деплой
   - На production сервере автоматически генерируется
     `settings.production.local.yaml` из secrets
   - Используется `docker-compose.prod.yaml` с PostgreSQL + S3 (без local
     storage)

## 🔒 Безопасность

### ⚠️ Важные правила

1. **Никогда не коммитьте реальные credentials в код**
2. **Используйте только тестовые бакеты для тестов**
3. **Ограничьте права доступа тестовых ключей**
4. **Регулярно ротируйте ключи доступа**

### 🛡️ Рекомендации по безопасности

1. **Создайте отдельного IAM пользователя для тестов:**

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::avatar-gen-test",
           "arn:aws:s3:::avatar-gen-test/*"
         ]
       }
     ]
   }
   ```

2. **Настройте lifecycle политику для тестового бакета:**

   ```json
   {
     "Rules": [
       {
         "Id": "DeleteOldTestData",
         "Status": "Enabled",
         "ExpirationInDays": 1
       }
     ]
   }
   ```

3. **Мониторинг использования:**
   - Настройте CloudWatch алерты
   - Отслеживайте размер бакета
   - Проверяйте логи доступа

## 🚀 Настройка Production секретов

### Пошаговая инструкция

#### 1. SSH доступ

Генерация SSH ключа для деплоя:

```bash
# Генерация SSH ключа
ssh-keygen -t rsa -b 4096 -C "deploy@avatar-gen" -f ~/.ssh/avatar-gen-deploy

# Копирование публичного ключа на сервер
ssh-copy-id -i ~/.ssh/avatar-gen-deploy.pub user@your-server.com

# Получение приватного ключа для GitHub Secret
cat ~/.ssh/avatar-gen-deploy
```

Добавьте приватный ключ в `SSH_PRIVATE_KEY` (включая
`-----BEGIN RSA PRIVATE KEY-----` и `-----END RSA PRIVATE KEY-----`).

#### 2. Production S3

Создайте IAM пользователя с политикой:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::avatar-gen-production",
        "arn:aws:s3:::avatar-gen-production/*"
      ]
    }
  ]
}
```

#### 3. Production PostgreSQL

Создайте пользователя БД:

```sql
-- На production сервере PostgreSQL
CREATE DATABASE avatar_gen_prod;
CREATE USER avatar_user WITH ENCRYPTED PASSWORD 'SecurePassword123';
GRANT ALL PRIVILEGES ON DATABASE avatar_gen_prod TO avatar_user;

-- Дайте права на схему
\c avatar_gen_prod
GRANT ALL ON SCHEMA public TO avatar_user;
```

### Проверка конфигурации

После настройки всех секретов, проверьте деплой:

```bash
# 1. Локальная проверка SSH
ssh -i ~/.ssh/avatar-gen-deploy deploy@your-server.com "echo 'SSH OK'"

# 2. Тест S3 подключения
aws s3 ls s3://avatar-gen-production --profile production

# 3. Тест PostgreSQL подключения
psql -h db.example.com -U avatar_user -d avatar_gen_prod -c "SELECT version();"
```

### Автоматическая генерация конфигурации

При деплое автоматически создаётся `backend/settings.production.local.yaml`:

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: '${PROD_S3_ENDPOINT}'
      bucket: '${PROD_S3_BUCKET}'
      access_key: '${PROD_S3_ACCESS_KEY}'
      secret_key: '${PROD_S3_SECRET_KEY}'
      region: '${PROD_S3_REGION}'
      force_path_style: true
  database:
    driver: 'postgresql'
    network:
      host: '${PROD_DB_HOST}'
      port: ${PROD_DB_PORT}
      database: '${PROD_DB_NAME}'
      username: '${PROD_DB_USERNAME}'
      password: '${PROD_DB_PASSWORD}'
      ssl: false
  logging:
    level: 'warn'
    verbose: false
    pretty: false
```

Этот файл **не коммитится** в git и существует только на production сервере.

## 📊 Мониторинг

### Проверка статуса тестов

1. **GitHub Actions:**
   - Перейдите в `Actions` вкладку
   - Проверьте статус последних запусков
   - Изучите логи при ошибках

2. **S3 мониторинг:**

   ```bash
   # Проверка размера бакета
   aws s3 ls s3://avatar-gen-test --recursive --summarize

   # Проверка последних операций
   aws s3api list-objects-v2 --bucket avatar-gen-test --max-items 10
   ```

## 🐛 Устранение неполадок

### Частые проблемы

1. **"Access Denied" ошибки:**
   - Проверьте правильность access/secret keys
   - Убедитесь, что ключи имеют права на тестовый бакет
   - Проверьте регион S3

2. **"Bucket not found" ошибки:**
   - Убедитесь, что бакет существует
   - Проверьте правильность названия бакета
   - Убедитесь, что бакет в правильном регионе

3. **"Connection timeout" ошибки:**
   - Проверьте доступность endpoint'а
   - Убедитесь в правильности URL
   - Проверьте сетевые настройки

### Логи для отладки

Включите verbose логирование в тестах:

```yaml
# В settings.test.yaml
logging:
  level: 'debug'
  verbose: true
  pretty: true
```

## 📚 Полезные ссылки

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS S3 IAM Policies](https://docs.aws.amazon.com/s3/latest/userguide/using-iam-policies.html)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Поддержка:** DevOps Team  
**Последнее обновление:** 2025-10-04
