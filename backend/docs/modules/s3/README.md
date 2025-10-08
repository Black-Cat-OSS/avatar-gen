# S3 Module

## Описание

Корневой модуль для работы с S3-совместимым хранилищем. Предоставляет низкоуровневый API для операций с S3, который может использоваться различными модулями приложения.

## Расположение

```
src/modules/s3/
├── s3.service.ts              # Реализация IS3Connection
├── s3.module.ts               # Модуль NestJS
├── s3.service.spec.ts         # Unit тесты
├── interfaces/
│   └── s3-connection.interface.ts  # Интерфейс IS3Connection
└── index.ts                   # Экспорты
```

## Архитектура

### Разделение ответственности

**S3Module (корневой)** - низкоуровневые операции:

- Управление подключением к S3
- CRUD операции с объектами (uploadObject, getObject, deleteObject)
- Health checks и reconnect логика
- Универсальное использование для любых данных

**S3StorageModule** (в storage/) - высокоуровневые операции:

- Сохранение/загрузка аватаров
- Бизнес-логика работы с аватарами
- Использует S3Module как зависимость

```
┌─────────────────────────┐
│  S3StorageModule        │  High-level (аватары)
│  (storage/modules/s3/)  │
└───────────┬─────────────┘
            │ depends on
            ▼
┌─────────────────────────┐
│      S3Module           │  Low-level (S3 API)
│    (modules/s3/)        │
└─────────────────────────┘
```

## IS3Connection Interface

Определяет контракт для работы с S3:

```typescript
export interface IS3Connection {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;

  healthCheck(): Promise<boolean>;
  reconnect(): Promise<void>;

  uploadObject(key: string, data: Buffer, contentType: string): Promise<string>;
  getObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
  objectExists(key: string): Promise<boolean>;

  getS3Info(): S3Info;
}
```

## S3Service

### Инициализация

`S3Service` создается через factory в `S3Module`:

```typescript
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Service,
      useFactory: (configService: YamlConfigService) => {
        const storageConfig = configService.getStorageConfig();
        if (storageConfig.type !== 's3' || !storageConfig.s3) {
          throw new Error('S3Module requires S3 configuration');
        }
        return new S3Service({
          app: { storage: { s3: storageConfig.s3 } },
        });
      },
      inject: [YamlConfigService],
    },
  ],
  exports: [S3Service],
})
export class S3Module {}
```

**Важно:** S3Module выбрасывает ошибку, если S3 не настроен. Он должен импортироваться только когда `storage.type === 's3'`.

### Retry логика

При подключении к S3 используется retry механизм:

```typescript
private async connectWithRetry(retryCount = 1): Promise<void> {
  const maxRetries = this.config.connection?.maxRetries || 3;
  const retryDelay = this.config.connection?.retryDelay || 2000;

  try {
    await this.client.send(new HeadBucketCommand({ Bucket: this.getBucketName() }));
    this.isConnected = true;
  } catch (error) {
    if (retryCount < maxRetries) {
      await this.delay(retryDelay);
      await this.connectWithRetry(retryCount + 1);
    } else {
      throw new Error(`Failed to connect to S3 after ${maxRetries} attempts`);
    }
  }
}
```

**Параметры:**

- `maxRetries` - максимальное количество попыток (по умолчанию 3)
- `retryDelay` - задержка между попытками в мс (по умолчанию 2000)

## Основные методы

### uploadObject()

Загружает объект в S3:

```typescript
async uploadObject(key: string, data: Buffer, contentType: string): Promise<string>
```

**Параметры:**

- `key` - путь к объекту в S3 (например, `avatars/abc123.obj`)
- `data` - данные в виде Buffer
- `contentType` - MIME тип (например, `application/json`)

**Возвращает:** URL загруженного объекта

### getObject()

Скачивает объект из S3:

```typescript
async getObject(key: string): Promise<Buffer>
```

**Параметры:**

- `key` - путь к объекту в S3

**Возвращает:** Buffer с данными объекта

**Выбрасывает:** NotFoundException если объект не найден

### deleteObject()

Удаляет объект из S3:

```typescript
async deleteObject(key: string): Promise<void>
```

### objectExists()

Проверяет существование объекта:

```typescript
async objectExists(key: string): Promise<boolean>
```

### healthCheck()

Проверяет доступность S3:

```typescript
async healthCheck(): Promise<boolean>
```

**Использование:**

```typescript
const isHealthy = await this.s3Service.healthCheck();
if (!isHealthy) {
  await this.s3Service.reconnect();
}
```

## Конфигурация

S3 конфигурация в `settings.yaml`:

```yaml
app:
  storage:
    type: 's3'
    s3:
      endpoint: 'https://your-s3-endpoint.com' # S3-совместимый endpoint
      bucket: 'my-bucket-name' # Имя bucket
      access_key: 'YOUR_ACCESS_KEY' # Access key
      secret_key: 'YOUR_SECRET_KEY' # Secret key
      region: 'us-east-1' # Регион (по умолчанию us-east-1)
      force_path_style: true # Path-style URLs (для совместимости)
      connection:
        maxRetries: 5 # Попыток подключения
        retryDelay: 1000 # Задержка между попытками (мс)
```

### Environment Variables

Для production рекомендуется использовать переменные окружения:

```bash
STORAGE_TYPE=s3
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=my-bucket
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=yyy
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
S3_MAX_RETRIES=5
S3_RETRY_DELAY=1000
```

## Использование

### В других модулях

```typescript
import { S3Module, S3Service } from '../s3';

@Module({
  imports: [S3Module],
  providers: [MyService],
})
export class MyModule {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(filename: string, data: Buffer): Promise<string> {
    return await this.s3Service.uploadObject(`files/${filename}`, data, 'application/octet-stream');
  }
}
```

### Проверка состояния

```typescript
const s3Info = this.s3Service.getS3Info();
console.log(`Connected to: ${s3Info.endpoint}/${s3Info.bucket}`);
console.log(`Region: ${s3Info.region}`);
console.log(`Is connected: ${s3Info.isConnected}`);
```

## Обработка ошибок

S3Service логирует все ошибки через NestJS Logger:

```typescript
try {
  await this.s3Service.uploadObject(key, data, contentType);
} catch (error) {
  // Ошибка уже залогирована через Logger
  // Обработайте её соответствующим образом
  throw new InternalServerErrorException('Failed to upload to S3');
}
```

## Тестирование

### Unit тесты

Файл: `src/modules/s3/s3.service.spec.ts`

**Покрытие:**

- Health checks и reconnect логика
- Retry механизм при подключении
- CRUD операции с объектами
- Обработка ошибок S3

**Запуск:**

```bash
npm test -- s3.service.spec.ts
```

### Моки для тестирования

Для тестирования модулей, зависящих от S3Service:

```typescript
const mockS3Service = {
  uploadObject: jest.fn().mockResolvedValue('https://s3.example.com/object'),
  getObject: jest.fn().mockResolvedValue(Buffer.from('data')),
  deleteObject: jest.fn().mockResolvedValue(undefined),
  objectExists: jest.fn().mockResolvedValue(true),
  healthCheck: jest.fn().mockResolvedValue(true),
  getS3Info: jest.fn().mockReturnValue({
    endpoint: 'https://s3.example.com',
    bucket: 'test-bucket',
    region: 'us-east-1',
    isConnected: true,
    forcePathStyle: true,
  }),
};

const module = await Test.createTestingModule({
  providers: [MyService, { provide: S3Service, useValue: mockS3Service }],
}).compile();
```

## Связанные модули

- [S3 Storage Module](../storage/S3_STORAGE.md) - Высокоуровневый модуль для аватаров
- [Storage Module](../storage/STORAGE_MODULE.md) - Главный модуль хранилища
- [Storage Configuration](../../STORAGE_CONFIGURATION.md) - Конфигурация

## Совместимость

S3Module совместим с:

- ✅ Amazon S3
- ✅ MinIO
- ✅ Beget Cloud Storage
- ✅ DigitalOcean Spaces
- ✅ Любые S3-совместимые хранилища

## Безопасность

1. **Никогда не коммитьте credentials** в репозиторий
2. Используйте переменные окружения для production
3. Настройте IAM политики для минимальных прав доступа:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`
   - `s3:HeadBucket`

## Производительность

- Все операции асинхронные
- Используется пул соединений AWS SDK
- Retry логика с экспоненциальным backoff (опционально)
- Рекомендуется настроить CDN перед S3 для публичного доступа

## Troubleshooting

### Failed to connect to S3 after N attempts

**Причина:**

- Неверные credentials
- Недоступен endpoint
- Bucket не существует

**Решение:**

1. Проверьте конфигурацию S3
2. Убедитесь что endpoint доступен
3. Проверьте access_key и secret_key
4. Увеличьте maxRetries и retryDelay

### Access Denied

**Причина:**
Недостаточно прав у access_key

**Решение:**
Настройте IAM политики для bucket

### Invalid endpoint

**Причина:**
Неверный формат endpoint

**Решение:**
Endpoint должен быть полным URL: `https://s3.region.provider.com`
