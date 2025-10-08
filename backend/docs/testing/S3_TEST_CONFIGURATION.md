# Конфигурация S3 для тестов

**Дата создания:** 2025-10-04  
**Версия:** 1.0

## 📋 Обзор

Данный документ описывает конфигурацию S3 хранилища для тестов, чтобы обеспечить изоляцию тестовых данных от production окружения.

## ⚠️ Важные принципы

### 🚫 Никогда не используйте production бакет для тестов!

- **Production бакет**: содержит реальные пользовательские данные
- **Тестовый бакет**: содержит временные тестовые данные, которые могут быть удалены

### ✅ Изоляция тестовых данных

Все тесты должны использовать отдельный тестовый бакет:

```yaml
# backend/settings.test.yaml
app:
  storage:
    type: 'local' # По умолчанию для быстрых тестов
    s3:
      endpoint: 'https://test-s3-endpoint.com'
      bucket: 'avatar-gen-test' # ← Тестовый бакет
      access_key: 'test-access-key'
      secret_key: 'test-secret-key'
      region: 'us-east-1'
      force_path_style: true
```

## 🔧 Настройка тестового бакета

### Для локальной разработки

#### Вариант 1: MinIO (рекомендуется)

MinIO - это S3-совместимый сервер, который можно запустить локально:

```bash
# Используя Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=test-access-key \
  -e MINIO_ROOT_PASSWORD=test-secret-key \
  minio/minio server /data --console-address ":9001"
```

Создайте тестовый бакет через MinIO Console (http://localhost:9001):

1. Войдите с credentials: `test-access-key` / `test-secret-key`
2. Создайте бакет `avatar-gen-test`

Обновите локальную конфигурацию:

```yaml
# backend/settings.test.local.yaml
app:
  storage:
    s3:
      endpoint: 'http://localhost:9000'
      bucket: 'avatar-gen-test'
      access_key: 'test-access-key'
      secret_key: 'test-secret-key'
      region: 'us-east-1'
      force_path_style: true
```

#### Вариант 2: LocalStack

LocalStack эмулирует AWS сервисы локально:

```bash
# Используя Docker
docker run -p 4566:4566 \
  -e SERVICES=s3 \
  localstack/localstack
```

Создайте бакет:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://avatar-gen-test
```

### Для CI/CD (GitHub Actions)

В GitHub Actions используется mock S3 сервис или MinIO:

```yaml
# .github/workflows/ci.yml
services:
  minio:
    image: minio/minio
    ports:
      - 9000:9000
    env:
      MINIO_ROOT_USER: test-access-key
      MINIO_ROOT_PASSWORD: test-secret-key
    options: >-
      --health-cmd "curl -f http://localhost:9000/minio/health/live"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Для реального облачного S3

Если вы используете реальный S3 провайдер для тестов:

1. **Создайте отдельный тестовый бакет**:
   - AWS S3: `avatar-gen-test`
   - Beget S3: `avatar-gen-test`
   - Yandex Object Storage: `avatar-gen-test`

2. **Настройте lifecycle политику для автоматической очистки**:

   ```json
   {
     "Rules": [
       {
         "Id": "DeleteOldTestData",
         "Status": "Enabled",
         "ExpirationInDays": 1,
         "Prefix": ""
       }
     ]
   }
   ```

3. **Ограничьте доступ только для CI/CD**:
   - Создайте отдельного IAM пользователя
   - Дайте права только на тестовый бакет
   - Сохраните credentials в GitHub Secrets

## 🧪 Матричное тестирование

В GitHub Actions тесты запускаются с разными комбинациями:

| Database   | Storage | S3 Bucket       | Описание                    |
| ---------- | ------- | --------------- | --------------------------- |
| SQLite     | local   | N/A             | Быстрые локальные тесты     |
| SQLite     | s3      | avatar-gen-test | Тесты с тестовым S3         |
| PostgreSQL | local   | N/A             | Интеграционные тесты        |
| PostgreSQL | s3      | avatar-gen-test | Полные интеграционные тесты |

## 🔒 Безопасность

### GitHub Secrets (опционально для реального S3)

Если используете реальный S3 для тестов:

```yaml
# GitHub Repository Settings → Secrets → Actions
TEST_S3_ENDPOINT      # https://your-test-s3-endpoint.com
TEST_S3_BUCKET        # avatar-gen-test
TEST_S3_ACCESS_KEY    # test-user-access-key
TEST_S3_SECRET_KEY    # test-user-secret-key
```

### Локальные настройки

```yaml
# backend/settings.test.local.yaml (НЕ коммитить!)
app:
  storage:
    s3:
      endpoint: 'http://localhost:9000' # Локальный MinIO
      bucket: 'avatar-gen-test'
      access_key: 'your-local-key'
      secret_key: 'your-local-secret'
```

## 🧹 Очистка тестовых данных

### Автоматическая очистка

После каждого теста:

```typescript
// Пример в тестах
afterEach(async () => {
  // Очистка тестового бакета
  await s3Service.emptyBucket('avatar-gen-test');
});
```

### Ручная очистка

```bash
# MinIO
mc rm --recursive --force myminio/avatar-gen-test

# AWS CLI
aws s3 rm s3://avatar-gen-test --recursive

# LocalStack
aws --endpoint-url=http://localhost:4566 s3 rm s3://avatar-gen-test --recursive
```

## 📊 Мониторинг

### Проверка размера бакета

```bash
# MinIO
mc du myminio/avatar-gen-test

# AWS CLI
aws s3 ls s3://avatar-gen-test --recursive --summarize
```

### Алерты

Настройте алерты, если тестовый бакет превышает определенный размер (например, 1GB):

- Это может указывать на утечку данных в тестах
- Проверьте, что cleanup выполняется корректно

## ✅ Чеклист для новых тестов

При добавлении новых S3 тестов:

- [ ] Использован тестовый бакет `avatar-gen-test`
- [ ] Добавлен cleanup после теста
- [ ] Тест изолирован от других тестов (уникальные ключи)
- [ ] Проверена работа в CI/CD
- [ ] Документирован в этом файле (если нужно)

## 🔗 Полезные ссылки

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [LocalStack S3](https://docs.localstack.cloud/user-guide/aws/s3/)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

---

**Поддержка:** Backend Team  
**Последнее обновление:** 2025-10-04
