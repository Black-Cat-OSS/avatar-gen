# Конфигурация хранилища

**Версия:** 0.0.2  
**Дата обновления:** 2025-10-04  
**Статус:** ✅ Production Ready

Полное руководство по настройке хранилища аватаров (локальное и S3).

---

## 🎯 Обзор

Avatar Generator поддерживает два типа хранилищ:

- **Local** - локальная файловая система (для разработки и небольших deployment)
- **S3** - S3-совместимое облачное хранилище (для production и масштабируемых систем)

Выбор типа хранилища осуществляется через конфигурационные файлы `settings.yaml`.

---

## 📁 Структура конфигурационных файлов

```
backend/
├── settings.yaml                # Базовая конфигурация (Local по умолчанию)
├── settings.development.yaml    # Конфигурация для разработки (S3 для тестирования)
├── settings.production.yaml     # Конфигурация для production (Local/S3)
└── settings.test.yaml           # Конфигурация для тестов (Local)
```

---

## 🔧 Конфигурация Local Storage

### Базовая конфигурация

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars' # Путь к директории хранилища
```

### Параметры

| Параметр          | Тип       | Обязательный              | По умолчанию | Описание                    |
| ----------------- | --------- | ------------------------- | ------------ | --------------------------- |
| `type`            | `'local'` | ✅ Да                     | -            | Тип хранилища               |
| `local.save_path` | `string`  | ✅ Да (если type='local') | -            | Путь к директории хранилища |

### Валидация

- `save_path` не может быть пустой строкой
- Директория создается автоматически при старте если не существует
- Путь может быть относительным или абсолютным

### Пример для разных окружений

**Development:**

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/dev-avatars'
```

**Production:**

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: '/var/app/avatars'
```

---

## ☁️ Конфигурация S3 Storage

### Базовая конфигурация

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3-endpoint.com'
      bucket: 'my-bucket-name'
      access_key: 'YOUR_ACCESS_KEY'
      secret_key: 'YOUR_SECRET_KEY'
      region: 'us-east-1'
      force_path_style: true
      connection:
        maxRetries: 3
        retryDelay: 2000
```

### Параметры

| Параметр                   | Тип            | Обязательный           | По умолчанию  | Описание                                  |
| -------------------------- | -------------- | ---------------------- | ------------- | ----------------------------------------- |
| `type`                     | `'s3'`         | ✅ Да                  | -             | Тип хранилища                             |
| `s3.endpoint`              | `string` (URL) | ✅ Да (если type='s3') | -             | URL endpoint S3 сервиса                   |
| `s3.bucket`                | `string`       | ✅ Да (если type='s3') | -             | Имя бакета                                |
| `s3.access_key`            | `string`       | ✅ Да (если type='s3') | -             | Access Key ID                             |
| `s3.secret_key`            | `string`       | ✅ Да (если type='s3') | -             | Secret Access Key                         |
| `s3.region`                | `string`       | ❌ Нет                 | `'us-east-1'` | Регион S3                                 |
| `s3.force_path_style`      | `boolean`      | ❌ Нет                 | `true`        | Path-style URLs вместо virtual-hosted     |
| `s3.connection.maxRetries` | `number`       | ❌ Нет                 | `3`           | Количество попыток подключения (1-10)     |
| `s3.connection.retryDelay` | `number`       | ❌ Нет                 | `2000`        | Задержка между попытками в мс (100-10000) |

### Валидация

- `endpoint` должен быть валидным URL
- `bucket`, `access_key`, `secret_key` не могут быть пустыми
- `maxRetries` должен быть от 1 до 10
- `retryDelay` должен быть от 100 до 10000 мс
- При старте приложения проверяется доступность бакета

### Примеры для разных провайдеров

#### Beget S3

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3-endpoint.com'
      bucket: 'my-bucket'
      access_key: 'YOUR_KEY'
      secret_key: 'YOUR_SECRET'
      region: 'us-east-1'
      force_path_style: true # ⚠️ Обязательно для Beget
```

#### AWS S3

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://s3.amazonaws.com'
      bucket: 'my-bucket'
      access_key: 'AWS_ACCESS_KEY_ID'
      secret_key: 'AWS_SECRET_ACCESS_KEY'
      region: 'us-east-1' # Укажите ваш регион
      force_path_style: false # Virtual-hosted style для AWS
```

#### MinIO

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'http://localhost:9000'
      bucket: 'avatars'
      access_key: 'minioadmin'
      secret_key: 'minioadmin'
      region: 'us-east-1'
      force_path_style: true # ⚠️ Обязательно для MinIO
```

---

## 🔐 Безопасность

### Рекомендации для Production

1. **Никогда не храните credentials в git:**

   ```bash
   # Добавьте в .gitignore
   settings.production.yaml
   .env
   ```

2. **Используйте переменные окружения:**

   ```yaml
   # settings.production.yaml
   app:
     storage:
       type: 's3'
       s3:
         endpoint: ${S3_ENDPOINT}
         bucket: ${S3_BUCKET}
         access_key: ${S3_ACCESS_KEY}
         secret_key: ${S3_SECRET_KEY}
   ```

3. **Ограничьте права доступа:**
   - Для S3: используйте IAM роли с минимальными правами (только нужный бакет)
   - Для файловой системы: ограничьте права доступа к директории (chmod 750)

### Пример IAM Policy (AWS)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket/*", "arn:aws:s3:::my-bucket"]
    }
  ]
}
```

---

## 🔄 Переключение между типами хранилищ

### Из Local в S3

1. **Обновите конфигурацию:**

   ```yaml
   app:
     storage:
       type: 's3' # Было: 'local'
       s3:
         endpoint: 'https://s3.example.com'
         # ... остальные параметры
   ```

2. **Мигрируйте существующие данные** (опционально):

   ```bash
   # Загрузите аватары из локальной директории в S3
   # Используйте AWS CLI или MinIO client
   aws s3 sync ./storage/avatars s3://my-bucket/avatars/
   ```

3. **Перезапустите приложение**

### Из S3 в Local

1. **Скачайте данные из S3:**

   ```bash
   aws s3 sync s3://my-bucket/avatars/ ./storage/avatars/
   ```

2. **Обновите конфигурацию:**

   ```yaml
   app:
     storage:
       type: 'local'
       local:
         save_path: './storage/avatars'
   ```

3. **Перезапустите приложение**

---

## ⚙️ Схема валидации (Zod)

```typescript
const configSchema = z
  .object({
    app: z.object({
      storage: z.object({
        type: z.enum(['local', 's3']),
        local: z
          .object({
            save_path: z.string().min(1),
          })
          .optional(),
        s3: z
          .object({
            endpoint: z.string().url(),
            bucket: z.string().min(1),
            access_key: z.string().min(1),
            secret_key: z.string().min(1),
            region: z.string().default('us-east-1'),
            force_path_style: z.boolean().default(true),
            connection: z.object({
              maxRetries: z.number().min(1).max(10).default(3),
              retryDelay: z.number().min(100).max(10000).default(2000),
            }),
          })
          .optional(),
      }),
    }),
  })
  .superRefine((data, ctx) => {
    // Проверка что конфигурация соответствует выбранному типу
    if (data.app.storage.type === 'local' && !data.app.storage.local) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage configuration for type "local" is required',
        path: ['app', 'storage', 'local'],
      });
    }
    if (data.app.storage.type === 's3' && !data.app.storage.s3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage configuration for type "s3" is required',
        path: ['app', 'storage', 's3'],
      });
    }
  });
```

---

## 🛠️ Troubleshooting

### Storage configuration for type "X" is required

**Проблема:** Указан `storage.type`, но соответствующая секция конфигурации отсутствует

**Решение:**

```yaml
# Если type: 'local', добавьте:
storage:
  type: 'local'
  local:
    save_path: './storage/avatars'

# Если type: 's3', добавьте:
storage:
  type: 's3'
  s3:
    endpoint: '...'
    # ... остальные параметры
```

### S3 connection failed after N attempts

**Причины:**

- Неправильный endpoint
- Неверные credentials
- Бакет не существует
- Сетевые проблемы

**Решение:** См. [S3 Storage Troubleshooting](./modules/storage/S3_STORAGE.md#troubleshooting)

### Local storage path is not configured

**Причина:** Не указан `save_path` при `type: 'local'`

**Решение:**

```yaml
storage:
  type: 'local'
  local:
    save_path: './storage/avatars'
```

---

## 📊 Сравнение типов хранилищ

| Характеристика             | Local                       | S3                               |
| -------------------------- | --------------------------- | -------------------------------- |
| **Производительность**     | ⚡ Очень быстро             | 🌐 Зависит от сети               |
| **Масштабируемость**       | ❌ Ограничена диском        | ✅ Неограничена                  |
| **Стоимость**              | 💰 Бесплатно (диск сервера) | 💰 Оплата по использованию       |
| **Распределенные системы** | ❌ Не поддерживается        | ✅ Да                            |
| **Backup**                 | ⚠️ Требует настройки        | ✅ Автоматический (у провайдера) |
| **Доступность**            | ⚠️ Зависит от сервера       | ✅ 99.9%+ SLA                    |
| **Сложность настройки**    | ✅ Простая                  | ⚠️ Средняя                       |

### Рекомендации

- **Разработка:** Local (быстрее, проще)
- **Staging:** S3 (тестирование production конфигурации)
- **Production (single server):** Local или S3
- **Production (multiple servers):** ✅ Только S3

---

## 🔗 Связанные разделы

- [Storage Module Documentation](./modules/storage/STORAGE_MODULE.md)
- [S3 Storage Details](./modules/storage/S3_STORAGE.md)
- [Local Storage Details](./modules/storage/LOCAL_STORAGE.md)
- [Database Configuration](./DATABASE_CONFIGURATION.md)

---

**Обновлено:** 2025-10-04
