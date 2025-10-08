# Database Module - Hotfix v3.0.1

## Проблема

После рефакторинга v3.0.0, оба провайдера БД (SQLite и PostgreSQL) все еще инициализировались и подключались, даже если в конфигурации был выбран только один:

```
[2025-10-01 15:50:59.719 +0400] INFO: PostgreSQL database connected successfully on attempt 1
```

Хотя в `settings.yaml` был выбран `driver: "sqlite"` ❌

## Причина

### Попытка исправления #1 (не сработала)

Убрали `OnModuleInit` и `OnModuleDestroy` из провайдеров:

```typescript
// Было
export class SqliteDatabaseService
  extends PrismaClient
  implements IDatabaseConnection, OnModuleInit, OnModuleDestroy

// Стало
export class SqliteDatabaseService
  extends PrismaClient
  implements IDatabaseConnection
```

**Проблема:** Даже без `OnModuleInit`, оба провайдера все равно регистрировались в модуле:

```typescript
@Module({
  providers: [
    SqliteDatabaseService,     // ← Создается экземпляр
    PostgresDatabaseService,   // ← Создается экземпляр
    DatabaseService,
  ],
})
```

NestJS создавал экземпляры ОБОИХ провайдеров при старте, и `extends PrismaClient` + `super()` в конструкторе мог инициировать подключение.

## Решение - Factory Provider

Используем **factory pattern** для создания только нужного провайдера:

### DatabaseModule (новая версия)

```typescript
@Module({
  providers: [
    {
      provide: 'DATABASE_PROVIDER_FACTORY',
      useFactory: (configService: YamlConfigService) => {
        const driver = configService.getConfig().app.database.driver;

        // Создается ТОЛЬКО выбранный провайдер!
        if (driver === DatabaseDriver.SQLITE) {
          return new SqliteDatabaseService(configService);
        } else if (driver === DatabaseDriver.POSTGRESQL) {
          return new PostgresDatabaseService(configService);
        }

        throw new Error(`Unsupported driver: ${driver}`);
      },
      inject: [YamlConfigService],
    },
    {
      provide: DatabaseService,
      useFactory: (provider, configService) => {
        return new DatabaseService(configService, provider);
      },
      inject: ['DATABASE_PROVIDER_FACTORY', YamlConfigService],
    },
  ],
})
```

### DatabaseService (обновлен)

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: YamlConfigService,
    activeProvider: IDatabaseConnection, // ← Только ОДИН провайдер
  ) {
    this.activeConnection = activeProvider;
  }

  // Больше не нужен selectDatabaseProvider()
}
```

## Преимущества нового подхода

### ✅ Нулевой overhead

- Неиспользуемый провайдер **физически не создается**
- Не занимает память
- Не создает экземпляр PrismaClient

### ✅ Невозможность случайного подключения

- Провайдер не существует в DI контейнере
- Нет риска обращения к неправильной БД

### ✅ Чистые логи

Только сообщения от активной БД:

**При `driver: "sqlite"`:**

```
[DatabaseService] LOG Database service initialized with driver: sqlite
[DatabaseService] LOG Initializing sqlite database connection...
[SqliteDatabaseService] LOG SQLite database connected successfully on attempt 1
```

**НЕТ сообщений от PostgreSQL** ✓

### ✅ Экономия ресурсов

- Один PrismaClient вместо двух
- Одно подключение вместо двух
- Меньше потребление памяти

## Последовательность инициализации (исправлено)

```
1. NestJS запускает приложение
   └─> DatabaseModule
       └─> Factory: DATABASE_PROVIDER_FACTORY
           └─> Читает config.app.database.driver
               └─> driver === 'sqlite'
                   └─> return new SqliteDatabaseService(config)

                   ⚠️ PostgresDatabaseService НЕ СОЗДАН!

2. Factory: DatabaseService
   └─> new DatabaseService(config, sqliteService)

3. NestJS вызывает OnModuleInit
   └─> DatabaseService.onModuleInit()
       └─> sqliteService.onModuleInit()
           └─> connectWithRetry()
               └─> $connect() [SQLite подключается]

Результат: ТОЛЬКО SQLite создан и подключен ✓
```

## Тестирование

### Проверка при `driver: "sqlite"`

**Запуск:**

```bash
cd backend
npm run start:dev
```

**Ожидаемые логи:**

```
[DatabaseService] LOG Database service initialized with driver: sqlite
[DatabaseService] LOG Initializing sqlite database connection...
[SqliteDatabaseService] LOG SQLite database connected successfully on attempt 1
```

**НЕ должно быть:**

```
[PostgresDatabaseService] LOG ...  ❌
```

### Проверка при `driver: "postgresql"`

Измените `settings.yaml`:

```yaml
app:
  database:
    driver: 'postgresql' # Изменить на postgresql
```

**Ожидаемые логи:**

```
[DatabaseService] LOG Database service initialized with driver: postgresql
[DatabaseService] LOG Initializing postgresql database connection...
[PostgresDatabaseService] LOG PostgreSQL database connected successfully on attempt 1
```

**НЕ должно быть:**

```
[SqliteDatabaseService] LOG ...  ❌
```

## Измененные файлы

1. **database.module.ts** - использует factory providers
2. **database.service.ts** - принимает один провайдер через конструктор
3. **ARCHITECTURE.md** - обновлена документация с новым подходом
4. **README.md** - обновлено описание overhead
5. **HOTFIX_v3.0.1.md** - этот файл

## Обратная совместимость

✅ **Полностью обратно совместимо**

Использование в сервисах не изменилось:

```typescript
constructor(private readonly db: DatabaseService) {}

async getData() {
  return await this.db.avatar.findMany();
}
```

## Версионирование

- **v3.0.0** - Рефакторинг на Facade Pattern (с багом двойной инициализации)
- **v3.0.1** - Hotfix: Factory Provider для единственного провайдера ← ТЕКУЩАЯ

## Примечания

Этот hotfix был необходим из-за особенностей работы NestJS DI:

- Все провайдеры в массиве `providers` создаются как синглтоны
- `extends PrismaClient` создает подключение при создании экземпляра
- Factory pattern позволяет создавать провайдеры условно

## Статус

✅ **ИСПРАВЛЕНО** - теперь создается только выбранный провайдер
