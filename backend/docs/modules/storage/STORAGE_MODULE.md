# Storage Module

## Описание

Главный модуль хранилища, который обеспечивает абстракцию для работы с различными типами хранилищ (локальное хранилище, S3). Использует паттерн **Strategy** для переключения между различными реализациями хранилища.

## Архитектура

Модуль построен на принципах **SOLID** и использует динамические модули NestJS для гибкой конфигурации.

### Структура файлов

```
storage/
├── modules/
│   ├── local/              # Модуль локального хранилища
│   │   ├── local-storage.service.ts
│   │   ├── local-storage.module.ts (implements IStorageModule)
│   │   └── index.ts
│   └── s3/                 # Модуль S3 хранилища (high-level)
│       ├── s3-storage.service.ts
│       ├── s3-storage.module.ts (implements IStorageModule)
│       └── index.ts
├── storage.module.ts       # Динамический модуль с Registry Pattern
└── storage.service.ts      # Главный сервис с паттерном Strategy

modules/s3/                 # Корневой S3 модуль (low-level)
├── s3.service.ts           # Низкоуровневые операции с S3
├── s3.module.ts
├── interfaces/
│   └── s3-connection.interface.ts
└── index.ts

common/interfaces/
├── storage-strategy.interface.ts    # Контракт для сервисов
└── storage-module.interface.ts      # Контракт для модулей
```

### Registry Pattern

Модуль использует **Registry Pattern** для управления типами хранилищ:

```typescript
// Реестр модулей - сопоставление типа с модулем
const STORAGE_MODULES_REGISTRY: Record<string, Type<IStorageModule>> = {
  local: LocalStorageModule,
  s3: S3StorageModule,
  // Легко добавить новый тип: ftp: FtpStorageModule
};

// Реестр сервисов - сопоставление типа с сервисом
const STORAGE_SERVICES_REGISTRY: Record<string, Type<IStorageStrategy>> = {
  local: LocalStorageService,
  s3: S3StorageService,
  // Легко добавить новый тип: ftp: FtpStorageService
};
```

**Преимущества:**

- ✅ Легко добавлять новые типы хранилищ
- ✅ Type safety через `IStorageModule` и `IStorageStrategy`
- ✅ Автоматическая валидация с подсказками
- ✅ Условный импорт - загружается только нужный модуль

## Компоненты

### StorageModule

Динамический модуль, который автоматически подключает нужную реализацию хранилища на основе конфигурации.

**Методы регистрации:**

#### `StorageModule.register()`

Стандартная регистрация модуля. **Условно импортирует только нужный модуль** (Local ИЛИ S3) на основе конфигурации.

```typescript
@Module({
  imports: [StorageModule.register()], // Импортирует LocalStorageModule ИЛИ S3StorageModule
})
export class AvatarModule {}
```

**Поведение:**

- `type: 'local'` → импортирует только `LocalStorageModule`
- `type: 's3'` → импортирует только `S3StorageModule`
- Неизвестный тип → выбрасывает ошибку с доступными вариантами

#### `StorageModule.forRoot()`

Глобальная регистрация модуля. `StorageService` становится доступным во всем приложении.

```typescript
@Module({
  imports: [StorageModule.forRoot()],
})
export class AppModule {}
```

### StorageService

Главный сервис для работы с хранилищем. Использует паттерн **Strategy** для делегирования операций конкретной реализации.

**Основные методы:**

- `saveAvatar(avatarObject)` - Сохранение аватара
- `loadAvatar(id)` - Загрузка аватара
- `deleteAvatar(id)` - Удаление аватара
- `exists(id)` - Проверка существования аватара
- `getStorageType()` - Получение текущего типа хранилища

**Выбор стратегии:**

Стратегия выбирается через Registry Pattern:

```typescript
// В StorageModule.register():
{
  provide: STORAGE_STRATEGY,
  useFactory: (configService, ...storageServices) => {
    const storageType = configService.getStorageConfig().type;
    const serviceIndex = Object.keys(STORAGE_SERVICES_REGISTRY).indexOf(storageType);
    return storageServices[serviceIndex]; // LocalStorageService ИЛИ S3StorageService
  },
  inject: [
    YamlConfigService,
    ...Object.values(STORAGE_SERVICES_REGISTRY).map(token => ({
      token,
      optional: true,
    })),
  ],
}
```

**StorageService** получает стратегию через `@Inject(STORAGE_STRATEGY)`

## Конфигурация

### Выбор типа хранилища

В `settings.yaml` указывается тип хранилища:

```yaml
app:
  storage:
    type: 'local' # 'local' или 's3' - взаимоисключающие
```

### Локальное хранилище

```yaml
app:
  storage:
    type: 'local'
    local:
      save_path: './storage/avatars'
```

### S3 хранилище

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
      force_path_style: true
      connection:
        maxRetries: 3
        retryDelay: 2000
```

## Валидация конфигурации

Модуль автоматически проверяет конфигурацию при старте:

1. **Проверка типа хранилища:**
   - `storage.type` должен быть 'local' или 's3'
2. **Проверка соответствия конфигурации:**
   - Если `type: 'local'`, то `storage.local` должен быть определен
   - Если `type: 's3'`, то `storage.s3` должен быть определен

3. **Проверка обязательных полей:**
   - Для local: `save_path` (непустая строка)
   - Для S3: `endpoint` (валидный URL), `bucket`, `access_key`, `secret_key`

## Использование

### Базовый пример

```typescript
@Injectable()
export class AvatarService {
  constructor(private readonly storageService: StorageService) {}

  async createAvatar(seed: string): Promise<string> {
    const avatarObject = await this.generateAvatar(seed);

    // Сохраняется в local или s3 в зависимости от конфигурации
    const path = await this.storageService.saveAvatar(avatarObject);

    return path;
  }

  async getAvatar(id: string): Promise<AvatarObject> {
    // Загружается из local или s3 в зависимости от конфигурации
    return await this.storageService.loadAvatar(id);
  }

  async deleteAvatar(id: string): Promise<void> {
    await this.storageService.deleteAvatar(id);
  }
}
```

### Проверка типа хранилища

```typescript
const storageType = this.storageService.getStorageType();
console.log(`Using ${storageType} storage`); // 'local' или 's3'
```

## Паттерны проектирования

### Strategy Pattern

Модуль использует паттерн Strategy для поддержки различных типов хранилищ:

- **Interface:** `IStorageStrategy` - определяет контракт
- **Concrete Strategies:**
  - `LocalStorageService` - реализация для локального хранилища
  - `S3StorageService` - реализация для S3 хранилища
- **Context:** `StorageService` - использует выбранную стратегию

### Dependency Injection

Правильная стратегия инъектируется через:

- Токен `STORAGE_STRATEGY` (предпочтительно)
- `@Optional()` dependencies (fallback)

## Dynamic Modules

Модуль следует [best practices NestJS для динамических модулей](https://docs.nestjs.com/fundamentals/dynamic-modules).

### Ключевые особенности реализации

1. **Условный импорт модулей** - загружается только тот модуль, который настроен
2. **Registry Pattern** - упрощает добавление новых типов хранилищ
3. **Type Safety** - `IStorageModule` гарантирует корректную реализацию
4. **Dependency Injection** - использует опциональную инъекцию с проверками

```typescript
@Module({})
export class StorageModule {
  static register(): DynamicModule {
    const configService = new YamlConfigService();
    const storageType = configService.getStorageConfig().type;

    // Lookup в реестре - получаем нужный модуль
    const storageModuleImport = STORAGE_MODULES_REGISTRY[storageType];
    if (!storageModuleImport) {
      throw new Error(`Unknown storage type: "${storageType}"`);
    }

    return {
      module: StorageModule,
      imports: [ConfigModule, storageModuleImport], // Только нужный модуль!
      providers: [{ provide: STORAGE_STRATEGY, useFactory: ... }, StorageService],
      exports: [StorageService],
    };
  }
}
```

## Миграция между типами хранилищ

### Переключение с local на s3

1. Обновите конфигурацию в `settings.yaml`:

   ```yaml
   app:
     storage:
       type: 's3' # было 'local'
       s3:
         # ... s3 параметры
   ```

2. Перенесите существующие аватары:

   ```bash
   # Скрипт для миграции (создайте отдельно)
   node scripts/migrate-storage.js
   ```

3. Перезапустите приложение

### Переключение с s3 на local

1. Скачайте все объекты из S3 в локальную директорию
2. Обновите конфигурацию
3. Перезапустите приложение

## Troubleshooting

### Storage configuration for type "X" is required

**Причина:**
Указан `storage.type`, но соответствующая конфигурация отсутствует

**Решение:**
Добавьте соответствующий раздел конфигурации для выбранного типа

### LocalStorageService is not available but configured as storage type

**Причина:**
Модуль не смог инъектировать LocalStorageService

**Решение:**
Убедитесь что `LocalStorageModule` импортирован в `StorageModule.register()`

### S3StorageService is not available but configured as storage type

**Причина:**
Модуль не смог инъектировать S3StorageService

**Решение:**
Убедитесь что `S3StorageModule` импортирован и S3 конфигурация корректна

## Добавление нового типа хранилища

### Пример: добавление FTP хранилища

1. **Создайте модуль и сервис:**

```typescript
// src/modules/storage/modules/ftp/ftp-storage.module.ts
@Module({
  imports: [FtpModule],
  providers: [FtpStorageService],
  exports: [FtpStorageService],
})
export class FtpStorageModule implements IStorageModule {
  async onModuleInit(): Promise<void> {
    // Инициализация FTP
  }
}

// src/modules/storage/modules/ftp/ftp-storage.service.ts
@Injectable()
export class FtpStorageService implements IStorageStrategy {
  async saveAvatar(avatarObject: AvatarObject): Promise<string> {
    /* ... */
  }
  async loadAvatar(id: string): Promise<AvatarObject> {
    /* ... */
  }
  async deleteAvatar(id: string): Promise<void> {
    /* ... */
  }
  async exists(id: string): Promise<boolean> {
    /* ... */
  }
}
```

2. **Добавьте в реестры:**

```typescript
// backend/src/modules/storage/storage.module.ts
const STORAGE_MODULES_REGISTRY: Record<string, Type<IStorageModule>> = {
  local: LocalStorageModule,
  s3: S3StorageModule,
  ftp: FtpStorageModule, // ← Добавить сюда
};

const STORAGE_SERVICES_REGISTRY: Record<string, Type<IStorageStrategy>> = {
  local: LocalStorageService,
  s3: S3StorageService,
  ftp: FtpStorageService, // ← И сюда
};
```

3. **Обновите Zod схему:**

```typescript
// backend/src/config/configuration.ts
storage: z.object({
  type: z.enum(['local', 's3', 'ftp']), // ← Добавить 'ftp'
  // ...
});
```

4. **Готово!** Модуль автоматически подхватит новый тип

## Связанные модули

- [S3 Storage](./S3_STORAGE.md) - Модуль S3 хранилища
- [Local Storage](./LOCAL_STORAGE.md) - Модуль локального хранилища
- [S3 Module](../s3/README.md) - Корневой модуль для S3 операций
- [Storage Configuration](../../STORAGE_CONFIGURATION.md) - Конфигурация хранилища

## Тестирование

Модуль покрыт unit тестами:

- `local-storage.service.spec.ts` - 18 тестов
- `s3.service.spec.ts` - 20 тестов
- `s3-storage.service.spec.ts` - 14 тестов

Запуск тестов:

```bash
npm test
```
