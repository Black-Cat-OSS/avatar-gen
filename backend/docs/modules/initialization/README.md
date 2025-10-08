# Initialization Module

Модуль инициализации приложения, обеспечивающий правильную настройку окружения при запуске.

## 🎯 Назначение

Модуль инициализации гарантирует, что все необходимые директории и ресурсы созданы до запуска основного функционала приложения. Это предотвращает ошибки файловой системы и обеспечивает консистентную структуру данных.

## 🏗️ Архитектура

Модуль построен по паттерну **Manager** с плагинной архитектурой:

```
┌─────────────────────────────────────────────────┐
│         InitializationModule (Global)           │
└─────────────────────┬───────────────────────────┘
                      │
           ┌──────────▼──────────┐
           │ InitializationService │ ← Координатор
           └──────────┬───────────┘
                      │
     ┌────────────────▼────────────────┐
     │         IInitializer           │ ← Интерфейс
     └────────────────┬────────────────┘
                      │
          ┌───────────▼───────────┐
          │ DirectoryInitializer   │ ← Конкретная реализация
          │       Service         │
          └───────────────────────┘
```

### Компоненты

#### 1. InitializationService

Основной координатор, управляющий всеми инициализаторами:

- Автоматическое обнаружение инициализаторов
- Выполнение в порядке приоритета
- Обработка ошибок и откат
- Сбор статистики

#### 2. IInitializer (Интерфейс)

Контракт для всех инициализаторов:

- `getInitializerId()` - уникальный идентификатор
- `getPriority()` - приоритет выполнения
- `initialize()` - основная логика инициализации
- `rollback()` - откат при ошибках (опционально)

#### 3. DirectoryInitializerService

Конкретная реализация для создания директорий:

- Проверка существования директорий
- Создание недостающих директорий
- Мониторинг статуса директорий

## 🚀 Использование

Модуль автоматически активируется при запуске приложения благодаря декоратору `@Global()` и реализации `OnModuleInit`.

### Автоматическая инициализация

```typescript
// В AppModule
@Module({
  imports: [
    ConfigModule,
    InitializationModule, // ← Автоматически инициализирует директории
    DatabaseModule,
    LoggerModule,
    AvatarModule,
  ],
})
export class AppModule {}
```

### Ручное использование

```typescript
import { InitializationService } from './modules/initialization';

@Injectable()
export class MyService {
  constructor(private readonly initializationService: InitializationService) {}

  async someMethod() {
    // Получить статус инициализации
    const status = this.initializationService.getAllInitializerStatus();

    // Принудительная реинициализация (для тестирования)
    await this.initializationService.reinitialize();
  }
}
```

## 📁 Создаваемые директории

Модуль автоматически создает директории на основе настроек из `settings.yaml`:

### Извлечение директорий из конфигурации

Модуль анализирует `settings.yaml` и извлекает пути из следующих настроек:

- **`app.save_path`** - директория для аватаров
- **`app.database.sqlite_params.url`** - путь к SQLite базе данных (только если `driver: 'sqlite'`)
- **Дополнительные директории** - `logs/`

⚠️ **Важно:** Директория для базы данных создается **только для SQLite**. Для PostgreSQL создание директорий не требуется.

### Структура директорий

```
storage/                    # Основная директория данных
├── avatars/               # Сгенерированные аватары (из app.save_path)
└── database/              # SQLite база данных (из sqlite_params.url)
    └── database.sqlite

logs/                      # Логи приложения
```

### Пример извлечения из настроек

**SQLite (директории создаются):**

```yaml
# settings.yaml
app:
  save_path: './storage/avatars' # → создаст storage/avatars/
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.sqlite' # → создаст storage/database/
```

**PostgreSQL (директории БД не создаются):**

```yaml
# settings.yaml
app:
  save_path: './storage/avatars' # → создаст storage/avatars/
  database:
    driver: 'postgresql'
    network:
      host: 'localhost'
      port: 5432
      database: 'avatar_gen'
```

### Структура директорий

Модуль динамически определяет директории на основе конфигурации:

```typescript
// В DirectoryInitializerService
private extractDirectoriesFromConfig(): string[] {
  const directories = new Set<string>();

  // Извлекаем директории из различных настроек
  this.extractStorageDirectories(directories);
  this.extractDatabaseDirectories(directories);
  this.extractLogDirectories(directories);

  // Добавляем дополнительные директории для безопасности
  this.addAdditionalDirectories(directories);

  return Array.from(directories).sort();
}
```

### Методы извлечения директорий

- **`extractStorageDirectories()`** - извлекает директории из `app.save_path`
- **`extractDatabaseDirectories()`** - извлекает директории из `app.database.sqlite_params.url` (только для SQLite)
- **`extractLogDirectories()`** - добавляет директорию `logs/`
- **`addAdditionalDirectories()`** - добавляет корневые директории для безопасности

## 🔧 API Reference

### InitializationService

#### Методы управления

##### `getInitializerStatus(initializerId: string): InitializationStatus | undefined`

Получение статуса конкретного инициализатора.

**Параметры:**

- `initializerId` - Идентификатор инициализатора

**Возвращает:** Статус инициализации или `undefined`

##### `getAllInitializerStatus(): InitializationStatus[]`

Получение статуса всех инициализаторов.

**Возвращает:** Массив статусов всех инициализаторов

##### `reinitialize(): Promise<void>`

Принудительная реинициализация всех инициализаторов.

**Использование:**

```typescript
await this.initializationService.reinitialize();
```

### DirectoryInitializerService

#### Методы утилит

##### `getDirectoryStatus(): Promise<DirectoryStatus>`

Получение детальной информации о статусе всех директорий.

**Возвращает:**

```typescript
{
  storage: {
    'storage/avatars': {
      exists: true,
      size: 1024,
      created: '2025-10-01T12:00:00.000Z',
      modified: '2025-10-01T12:30:00.000Z'
    }
  }
}
```

##### `recreateDirectories(): Promise<void>`

Принудительное пересоздание всех директорий.

**Предупреждение:** Удаляет существующие директории!

## 🛠️ Расширение модуля

### Добавление нового инициализатора

1. **Создайте сервис, реализующий IInitializer:**

```typescript
@Injectable()
export class DatabaseInitializerService implements IInitializer {
  getInitializerId(): string {
    return 'database-initializer';
  }

  getPriority(): number {
    return 50; // После директорий, но до основного функционала
  }

  async isReady(): Promise<boolean> {
    // Проверка предварительных условий
    return true;
  }

  async initialize(): Promise<void> {
    // Логика инициализации базы данных
    this.logger.log('Initializing database...');
  }

  async rollback(): Promise<void> {
    // Откат изменений при ошибке
    this.logger.log('Rolling back database initialization...');
  }
}
```

2. **Добавьте в модуль:**

```typescript
@Module({
  providers: [
    InitializationService,
    DirectoryInitializerService,
    DatabaseInitializerService, // ← Новый инициализатор
  ],
  exports: [InitializationService, DirectoryInitializerService, DatabaseInitializerService],
})
export class InitializationModule {}
```

3. **Обновите индекс:**

```typescript
// src/modules/initialization/index.ts
export { DatabaseInitializerService } from './services/database-initializer.service';
```

## 📊 Мониторинг и логирование

### Логи инициализации

```
[InitializationService] LOG Starting application initialization...
[InitializationService] LOG Discovered 2 initializers
[InitializationService] LOG Executing 2 initializers...
[InitializationService] LOG Initializing: directory-initializer (priority: 10)
[DirectoryInitializerService] LOG Initializing application directories...
[DirectoryInitializerService] LOG ✓ Created directory: storage/avatars
[DirectoryInitializerService] LOG ✓ Created directory: storage/database
[InitializationService] LOG ✓ directory-initializer completed in 45ms
[InitializationService] LOG Initializing: database-initializer (priority: 50)
[DatabaseInitializerService] LOG Initializing database...
[InitializationService] LOG ✓ database-initializer completed in 123ms
[InitializationService] LOG Application initialization completed successfully
```

### Статусы инициализации

```typescript
const statuses = initializationService.getAllInitializerStatus();

statuses.forEach(status => {
  console.log(`${status.id}: ${status.status} (${status.duration}ms)`);
  if (status.error) {
    console.error(`Error: ${status.error}`);
  }
});
```

## 🔧 Конфигурация

Модуль инициализации читает настройки из `settings.yaml` и создает директории динамически.

### Настройки в settings.yaml

```yaml
app:
  save_path: './storage/avatars' # ← Директория для аватаров

database:
  sqlite_params:
    url: 'file:./storage/database/database.sqlite' # ← Путь к БД
```

### Добавление новых директорий

Чтобы модуль создавал дополнительные директории:

1. **Добавьте настройки в `settings.yaml`:**

   ```yaml
   app:
     temp_path: './storage/temp' # Новая настройка
   ```

2. **Обновите сервис извлечения директорий:**

   ```typescript
   private extractStorageDirectories(directories: Set<string>): void {
     // Директория для аватаров
     if (this.config.app?.save_path) {
       const avatarDir = dirname(this.config.app.save_path);
       directories.add(avatarDir);
     }

     // Новая директория для временных файлов
     if (this.config.app?.temp_path) {
       const tempDir = dirname(this.config.app.temp_path);
       directories.add(tempDir);
     }
   }
   ```

3. **Обновите Docker конфигурацию** при необходимости

## 🧪 Тестирование

### Unit тесты

```typescript
describe('DirectoryInitializerService', () => {
  let service: DirectoryInitializerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DirectoryInitializerService],
    }).compile();

    service = module.get(DirectoryInitializerService);
  });

  it('should create required directories', async () => {
    await service.onModuleInit();

    const status = await service.getDirectoryStatus();
    expect(status.storage['storage/avatars'].exists).toBe(true);
    expect(status.storage['storage/database'].exists).toBe(true);
  });
});
```

### Integration тесты

```typescript
describe('InitializationModule', () => {
  let app: INestApplication;
  let initializationService: InitializationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [InitializationModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    initializationService = module.get(InitializationService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should initialize all components', async () => {
    const statuses = initializationService.getAllInitializerStatus();

    expect(statuses).toHaveLength(1); // DirectoryInitializer
    expect(statuses[0].status).toBe('completed');
  });
});
```

## 🔒 Безопасность

Модуль безопасен по умолчанию:

- Создает только необходимые директории
- Не перезаписывает существующие файлы
- Использует `recursive: true` только для создания структуры
- Логирует все действия для аудита

## 📈 Производительность

- **Синхронная инициализация** - блокирует запуск до завершения
- **Минимальный overhead** - создает только недостающие директории
- **Кэширование** - проверяет существование перед созданием

## 🔄 Расширение для других нужд

Модуль легко расширяется для других типов инициализации:

### Примеры будущих инициализаторов

#### DatabaseInitializerService

```typescript
// Инициализация подключения к БД
async initialize(): Promise<void> {
  await this.databaseService.testConnection();
}
```

#### ConfigurationInitializerService

```typescript
// Валидация и подготовка конфигурации
async initialize(): Promise<void> {
  await this.configService.validateSettings();
}
```

#### CacheInitializerService

```typescript
// Предварительное заполнение кэша
async initialize(): Promise<void> {
  await this.cacheService.warmup();
}
```

#### MigrationInitializerService

```typescript
// Выполнение миграций БД
async initialize(): Promise<void> {
  await this.migrationService.runPendingMigrations();
}
```

## 📚 Связанная документация

- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Lifecycle](https://docs.nestjs.com/fundamentals/lifecycle-events)
- [File System Operations](https://nodejs.org/api/fs.html)

---

**Последнее обновление:** 2025-10-01
**Версия:** 1.0.0
**Статус:** ✅ Готов к использованию
