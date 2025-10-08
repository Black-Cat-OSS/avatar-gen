# Local Storage Module

## Описание

Модуль для работы с локальной файловой системой. Предоставляет возможность сохранять, загружать и удалять аватары в локальной файловой системе сервера.

## Архитектура

```
storage/modules/local/
├── local-storage.service.ts    # Сервис реализующий IStorageStrategy
├── local-storage.module.ts     # NestJS модуль
└── index.ts                    # Экспорты
```

## Компоненты

### LocalStorageService

Сервис для работы с локальной файловой системой, реализует интерфейс `IStorageStrategy`.

**Основные методы:**

- `saveAvatar(avatarObject)` - Сохранение аватара в файловую систему
- `loadAvatar(id)` - Загрузка аватара из файловой системы
- `deleteAvatar(id)` - Удаление аватара из файловой системы
- `exists(id)` - Проверка существования аватара

**Возможные ошибки:**

- `Failed to save avatar to local storage` - Ошибка при сохранении (нет прав, диск переполнен)
- `Avatar with ID {id} not found` - Аватар не найден
- `Failed to load avatar from local storage` - Ошибка при загрузке (файл поврежден, нет прав)
- `Failed to delete avatar from local storage` - Ошибка при удалении (нет прав, файл используется)

### LocalStorageModule

NestJS модуль, отвечающий за инициализацию локального хранилища.

**Что делает при инициализации:**

1. Проверяет существование директории хранилища
2. Создает директорию если она не существует (рекурсивно)
3. Логирует статус инициализации

## Конфигурация

### Параметры в settings.yaml

```yaml
app:
  storage:
    type: 'local' # Обязательно установить 'local' для использования локального хранилища
    local:
      save_path: './storage/avatars' # Путь к директории хранилища
```

### Ограничения

- `save_path` - обязательное поле, не может быть пустым
- Путь может быть относительным или абсолютным
- Директория будет создана автоматически при первом запуске

## Использование

### Через StorageService

LocalStorageService автоматически используется через `StorageService` когда `storage.type` установлен в `'local'`:

```typescript
@Injectable()
export class AvatarService {
  constructor(private readonly storageService: StorageService) {}

  async saveAvatar(avatarData: AvatarObject) {
    // Автоматически сохраняет локально если настроено
    const filePath = await this.storageService.saveAvatar(avatarData);
    return filePath; // ./storage/avatars/avatar-id.obj
  }
}
```

## Структура хранения

Аватары хранятся в указанной директории по следующей структуре:

```
storage/avatars/
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

## Мониторинг и логирование

Модуль логирует все важные операции:

- `Created directory: path` - Директория создана
- `Avatar saved to local storage: path` - Аватар сохранен
- `Avatar loaded from local storage: path` - Аватар загружен
- `Avatar deleted from local storage: path` - Аватар удален
- `Storage directory exists: path` - Директория существует
- `Storage directory created: path` - Директория создана при инициализации

## Troubleshooting

### Failed to save avatar to local storage

**Причины:**

- Недостаточно прав для записи в директорию
- Диск переполнен
- Путь недоступен (сетевой диск отключен)

**Решение:**

1. Проверьте права доступа к директории
2. Проверьте свободное место на диске
3. Убедитесь что путь доступен

### Local storage path is not configured

**Причина:**
В конфигурации не указан `save_path` для local storage

**Решение:**
Добавьте конфигурацию:

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
```

### Avatar with ID {id} not found

**Причина:**
Файл аватара не существует в указанной директории

**Решение:**

1. Проверьте что аватар был сохранен
2. Проверьте что ID корректен
3. Проверьте файловую систему

## Производительность

### Рекомендации

- Используйте SSD диски для лучшей производительности
- Регулярно делайте backup директории хранилища
- Мониторьте свободное место на диске
- Для высоконагруженных систем рассмотрите использование S3 вместо локального хранилища

### Ограничения

- Не подходит для распределенных систем (несколько инстансов приложения)
- Требует регулярного backup
- Ограничено размером диска

## Связанные модули

- [Storage Module](./STORAGE_MODULE.md) - Главный модуль хранилища
- [S3 Storage Module](./S3_STORAGE.md) - Модуль S3 хранилища
- [Configuration](../../DATABASE_CONFIGURATION.md) - Конфигурация приложения
