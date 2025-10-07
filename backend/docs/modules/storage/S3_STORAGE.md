# S3 Storage Module

## Описание

Модуль для работы с S3-совместимым хранилищем. Предоставляет возможность сохранять, загружать и удалять аватары в S3-совместимых облачных хранилищах (AWS S3, MinIO, Beget S3 и др.).

## Архитектура

Модуль использует паттерн **Strategy** для абстракции способа хранения данных и разделен на несколько компонентов:

```
storage/modules/s3/
├── interfaces/
│   └── s3-connection.interface.ts    # Интерфейс для S3 подключения
├── s3.service.ts                      # Low-level сервис для работы с S3 API
├── s3-storage.service.ts              # High-level сервис реализующий IStorageStrategy
├── s3-storage.module.ts               # NestJS модуль
└── s3.module.ts                       # Устаревший модуль (deprecated)
```

## Компоненты

### S3Service

Низкоуровневый сервис для прямого взаимодействия с S3 API.

**Основные методы:**

- `onModuleInit()` - Инициализация подключения к S3 с retry логикой
- `healthCheck()` - Проверка доступности бакета
- `uploadObject(key, data, contentType)` - Загрузка объекта
- `getObject(key)` - Получение объекта
- `deleteObject(key)` - Удаление объекта
- `objectExists(key)` - Проверка существования объекта
- `reconnect()` - Переподключение при потере соединения

**Возможные ошибки:**

- `S3 connection failed after N attempts` - Не удалось подключиться к S3 после всех попыток повторного подключения
- `Failed to upload object to S3` - Ошибка при загрузке объекта
- `Failed to get object from S3` - Ошибка при получении объекта (объект не найден или сетевая ошибка)
- `Failed to delete object from S3` - Ошибка при удалении объекта
- `Empty response body` - Пустой ответ от S3 при получении объекта

### S3StorageService

Высокоуровневый сервис, реализующий интерфейс `IStorageStrategy` для работы с аватарами.

**Основные методы:**

- `saveAvatar(avatarObject)` - Сохранение аватара в S3
- `loadAvatar(id)` - Загрузка аватара из S3
- `deleteAvatar(id)` - Удаление аватара из S3
- `exists(id)` - Проверка существования аватара

**Возможные ошибки:**

- `Failed to save avatar to S3` - Ошибка при сохранении аватара
- `Avatar with ID {id} not found` - Аватар не найден
- `Failed to load avatar from S3` - Ошибка при загрузке аватара
- `Failed to delete avatar from S3` - Ошибка при удалении аватара

### S3StorageModule

NestJS модуль, отвечающий за инициализацию S3 хранилища.

**Что делает при инициализации:**

1. Создает S3 клиент с конфигурацией из `settings.yaml`
2. Проверяет доступность S3 сервиса (с повторными попытками)
3. Проверяет доступность указанного бакета
4. Выбрасывает ошибку и останавливает приложение если S3 недоступен

## Конфигурация

### Параметры в settings.yaml

```yaml
app:
  storage:
    type: 's3' # Обязательно установить 's3' для использования S3
    s3:
      endpoint: 'https://your-s3-endpoint.com' # URL endpoint S3
      bucket: 'my-bucket-name' # Имя бакета
      access_key: 'YOUR_ACCESS_KEY' # Access Key ID
      secret_key: 'YOUR_SECRET_KEY' # Secret Access Key
      region: 'us-east-1' # Регион (по умолчанию us-east-1)
      force_path_style: true # Path-style URLs (для совместимых с S3)
      connection:
        maxRetries: 3 # Максимальное количество попыток подключения
        retryDelay: 2000 # Задержка между попытками (мс)
```

### Переменные окружения

Для production рекомендуется использовать переменные окружения для безопасного хранения credentials:

```bash
S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET=my-bucket-name
S3_ACCESS_KEY=YOUR_ACCESS_KEY
S3_SECRET_KEY=YOUR_SECRET_KEY
```

### Ограничения конфигурации

- `endpoint` - должен быть валидным URL
- `bucket` - обязательное поле, не может быть пустым
- `access_key` - обязательное поле, не может быть пустым
- `secret_key` - обязательное поле, не может быть пустым
- `maxRetries` - от 1 до 10
- `retryDelay` - от 100 до 10000 мс

## Использование

### Базовое использование

S3StorageService автоматически используется через `StorageService` когда `storage.type` установлен в `'s3'`:

```typescript
@Injectable()
export class AvatarService {
  constructor(private readonly storageService: StorageService) {}

  async saveAvatar(avatarData: AvatarObject) {
    // Автоматически сохраняет в S3 если настроено
    const url = await this.storageService.saveAvatar(avatarData);
    return url; // https://s3.example.com/bucket/avatars/avatar-id.obj
  }
}
```

### Прямое использование S3Service

Для специфичных S3 операций можно использовать S3Service напрямую:

```typescript
@Injectable()
export class CustomService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadCustomFile(key: string, data: Buffer) {
    await this.s3Service.uploadObject(key, data, 'application/octet-stream');
  }
}
```

## Retry логика

Модуль реализует автоматические повторные попытки подключения к S3:

1. **При инициализации** (`onModuleInit`):
   - Выполняется `healthCheck()` для проверки доступности бакета
   - При неудаче ждет `retryDelay` миллисекунд
   - Повторяет попытку до `maxRetries` раз
   - Выбрасывает ошибку и останавливает приложение если все попытки исчерпаны

2. **При работе**:
   - AWS SDK автоматически retry для сетевых ошибок
   - Timeout и network errors обрабатываются автоматически

## Структура хранения

Аватары хранятся в S3 по следующей структуре:

```
bucket-name/
└── avatars/
    ├── avatar-id-1.obj
    ├── avatar-id-2.obj
    └── avatar-id-N.obj
```

### Формат файла

Каждый файл `.obj` содержит JSON с сериализованным `AvatarObject`:

```json
{
  "meta_data_name": "avatar-id",
  "meta_data_created_at": "2025-01-01T00:00:00.000Z",
  "image_4n": [1, 2, 3, ...],  // Массив байтов
  "image_5n": [1, 2, 3, ...],
  "image_6n": [1, 2, 3, ...],
  "image_7n": [1, 2, 3, ...],
  "image_8n": [1, 2, 3, ...],
  "image_9n": [1, 2, 3, ...]
}
```

## Совместимость

Модуль совместим с любыми S3-compatible хранилищами:

- ✅ **AWS S3**
- ✅ **MinIO**
- ✅ **Beget S3**
- ✅ **DigitalOcean Spaces**
- ✅ **Backblaze B2**
- ✅ **Wasabi**
- ✅ Другие S3-совместимые сервисы

### Особенности для разных провайдеров

**Beget S3 / MinIO:**

```yaml
force_path_style: true # Обязательно для path-style URLs
```

**AWS S3:**

```yaml
force_path_style: false # Virtual-hosted-style URLs
region: 'us-east-1' # Укажите правильный регион
```

## Мониторинг и логирование

Модуль логирует все важные операции:

- `S3 client created` - Клиент создан
- `S3 connected successfully on attempt N` - Успешное подключение
- `Retrying S3 connection in Nms...` - Повторная попытка подключения
- `S3 connection failed after N attempts` - Все попытки исчерпаны
- `Object uploaded to S3: key` - Объект загружен
- `Object retrieved from S3: key` - Объект получен
- `Object deleted from S3: key` - Объект удален

### Health Check

Модуль автоматически проверяет доступность S3 при старте приложения. Если S3 недоступен, приложение не запустится.

## Troubleshooting

### S3 connection failed after N attempts

**Причины:**

- Неправильный endpoint URL
- Неверные credentials (access_key/secret_key)
- Бакет не существует
- Сетевые проблемы
- Firewall блокирует подключение

**Решение:**

1. Проверьте правильность endpoint в конфигурации
2. Убедитесь что access_key и secret_key корректны
3. Проверьте что бакет существует
4. Проверьте сетевую доступность S3 endpoint

### Failed to upload object

**Причины:**

- Недостаточно прав для записи
- Бакет заполнен (квота исчерпана)
- Объект слишком большой
- Сетевая ошибка

**Решение:**

1. Проверьте права доступа (IAM policy для AWS, права пользователя для MinIO)
2. Проверьте доступное место в бакете
3. Проверьте размер загружаемого объекта

### Empty response body

**Причины:**

- Объект пустой в S3
- Объект поврежден
- Проблема с сетью при скачивании

**Решение:**

1. Проверьте объект в S3 консоли/admin панели
2. Попробуйте скачать объект вручную
3. Пересоздайте объект

## Зависимости

- `@aws-sdk/client-s3` ^3.901.0 - AWS SDK для работы с S3

## Связанные модули

- [Storage Module](../storage/STORAGE_MODULE.md) - Главный модуль хранилища
- [Local Storage Module](./LOCAL_STORAGE.md) - Модуль локального хранилища
- [Configuration](../../DATABASE_CONFIGURATION.md) - Конфигурация приложения
