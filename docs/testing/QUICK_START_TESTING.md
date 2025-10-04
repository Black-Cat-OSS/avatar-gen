# 🚀 Быстрый старт тестирования

**Дата создания:** 2025-10-04  
**Версия:** 1.0

## 📋 Обзор

Этот документ поможет вам быстро настроить и запустить тесты с различными
конфигурациями S3 и баз данных.

## 🛠️ Настройка локального тестирования

### Вариант 1: Использование скрипта (Рекомендуется)

1. **Сгенерируйте конфигурацию:**

   ```bash
   # Для SQLite + Local storage
   ./scripts/generate-test-config.sh sqlite local

   # Для SQLite + S3
   ./scripts/generate-test-config.sh sqlite s3 https://your-s3-endpoint.com your-test-bucket

   # Для PostgreSQL + S3
   ./scripts/generate-test-config.sh postgresql s3 https://your-s3-endpoint.com your-test-bucket
   ```

2. **Установите переменные окружения (для S3):**

   ```bash
   export TEST_S3_ACCESS_KEY=your-access-key
   export TEST_S3_SECRET_KEY=your-secret-key
   export TEST_S3_REGION=us-east-1
   ```

3. **Запустите тесты:**
   ```bash
   cd backend
   NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test
   ```

### Вариант 2: Ручная настройка

1. **Скопируйте пример файла:**

   ```bash
   cp backend/settings.test.example.yaml backend/settings.test.yaml
   ```

2. **Отредактируйте настройки:**

   ```yaml
   app:
     storage:
       type: 's3'
       s3:
         endpoint: 'https://your-s3-endpoint.com'
         bucket: 'your-test-bucket'
         access_key: 'your-access-key'
         secret_key: 'your-secret-key'
         region: 'us-east-1'
   ```

3. **Запустите тесты:**
   ```bash
   cd backend
   NODE_ENV=test pnpm run test
   ```

## ☁️ Настройка S3 для тестирования

### Использование MinIO (локально)

1. **Запустите MinIO:**

   ```bash
   docker run -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=test-access-key \
     -e MINIO_ROOT_PASSWORD=test-secret-key \
     minio/minio server /data --console-address ":9001"
   ```

2. **Создайте бакет:**
   - Откройте http://localhost:9001
   - Войдите с учетными данными выше
   - Создайте бакет `avatar-gen-test`

3. **Настройте тесты:**
   ```yaml
   s3:
     endpoint: 'http://localhost:9000'
     bucket: 'avatar-gen-test'
     access_key: 'test-access-key'
     secret_key: 'test-secret-key'
     force_path_style: true
   ```

### Использование AWS S3

1. **Создайте тестовый бакет:**

   ```bash
   aws s3 mb s3://avatar-gen-test
   ```

2. **Настройте IAM политику:**

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

3. **Создайте пользователя IAM** и примените политику

## 🧪 Запуск тестов

### Локальные тесты

```bash
# Unit тесты
NODE_ENV=test pnpm run test

# E2E тесты
NODE_ENV=test pnpm run test:e2e

# Все тесты
NODE_ENV=test pnpm run test:all
```

### Тесты с матричной конфигурацией

```bash
# SQLite + Local
NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test

# SQLite + S3
NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test

# PostgreSQL + S3 (требует запущенный PostgreSQL)
NODE_ENV=test TEST_MATRIX_CONFIG=./settings.test.matrix.yaml pnpm run test
```

## 🐳 Тестирование с Docker

### Запуск PostgreSQL для тестов

```bash
docker run --name postgres-test \
  -e POSTGRES_DB=avatar_gen_test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:17-alpine
```

### Запуск MinIO для S3 тестов

```bash
docker run --name minio-test \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=test-access-key \
  -e MINIO_ROOT_PASSWORD=test-secret-key \
  -d minio/minio server /data --console-address ":9001"
```

## 🔧 GitHub Actions

### Настройка секретов

Добавьте следующие секреты в GitHub:

```
TEST_S3_ENDPOINT=https://your-s3-endpoint.com
TEST_S3_BUCKET=your-test-bucket
TEST_S3_ACCESS_KEY=your-access-key
TEST_S3_SECRET_KEY=your-secret-key
TEST_S3_REGION=us-east-1
```

### Запуск тестов

1. **Автоматический запуск:** Создайте Pull Request
2. **Ручной запуск:** Перейдите в Actions → Test with Local Configuration
3. **Полное матричное тестирование:** Actions → Full Matrix Testing

## 🐛 Устранение неполадок

### Частые ошибки

1. **"Access Denied"**
   - Проверьте S3 credentials
   - Убедитесь, что бакет существует
   - Проверьте права доступа

2. **"Connection refused"**
   - Убедитесь, что PostgreSQL/MinIO запущены
   - Проверьте порты (5432 для PostgreSQL, 9000 для MinIO)

3. **"Configuration not found"**
   - Проверьте путь к файлу конфигурации
   - Убедитесь, что файл существует

### Логи для отладки

Включите подробные логи:

```yaml
logging:
  level: 'debug'
  verbose: true
  pretty: true
```

## 📚 Полезные команды

```bash
# Проверка конфигурации
NODE_ENV=test node -e "console.log(require('./src/config/yaml-config.service').YamlConfigService)"

# Очистка тестовых данных
rm -rf backend/storage/test-*

# Проверка подключения к S3
aws s3 ls s3://your-test-bucket

# Проверка подключения к PostgreSQL
psql -h localhost -U postgres -d avatar_gen_test -c "SELECT 1;"
```

## 🔗 Связанные документы

- [GitHub Secrets Configuration](GITHUB_SECRETS_CONFIGURATION.md)
- [S3 Test Configuration](S3_TEST_CONFIGURATION.md)
- [Testing Documentation](TESTING.md)

---

**Поддержка:** Backend Team  
**Последнее обновление:** 2025-10-04
