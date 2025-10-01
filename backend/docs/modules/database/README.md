# Database Module

Модуль для работы с базами данных, поддерживающий SQLite и PostgreSQL с единым интерфейсом взаимодействия.

## Архитектура

Модуль использует паттерн **Facade** для управления различными реализациями баз данных. `DatabaseService` выступает в роли управляющего сервиса, который автоматически выбирает нужную реализацию и делегирует все операции.

⚠️ **Важно:** Создается и подключается **только выбранная** БД на основе конфигурации. Неиспользуемые провайдеры **физически не создаются** (нулевой overhead). Подробнее см. [ARCHITECTURE.md](./ARCHITECTURE.md).

### Структура модуля

```
database/
├── constants/           # Константы и токены
│   ├── database.constants.ts
│   └── index.ts
├── interfaces/         # Интерфейсы для взаимодействия с БД
│   ├── database-connection.interface.ts
│   └── index.ts
├── providers/          # Конкретные реализации БД
│   ├── sqlite-database.service.ts
│   ├── postgres-database.service.ts
│   └── index.ts
├── database.service.ts  # Основной фасад-сервис (управляющий)
├── database.module.ts   # Модуль NestJS
├── index.ts            # Экспорт публичного API
├── README.md           # Документация (этот файл)
├── ARCHITECTURE.md     # Детальная архитектура и управление жизненным циклом
├── MIGRATION_GUIDE.md  # Руководство по миграции
└── CHANGELOG_MODULE.md # История изменений
```

### Компоненты архитектуры

#### 1. DatabaseService (Facade)
Основной управляющий сервис:
- Выбирает нужную реализацию на основе конфигурации
- Делегирует все вызовы активному провайдеру
- Управляет жизненным циклом подключений
- Предоставляет единую точку доступа к БД

#### 2. Провайдеры (Providers)
Конкретные реализации для каждой БД:
- **SqliteDatabaseService** - реализация для SQLite
- **PostgresDatabaseService** - реализация для PostgreSQL

Все провайдеры реализуют интерфейс `IDatabaseConnection`.

#### 3. Интерфейс IDatabaseConnection
Определяет контракт для всех реализаций БД, обеспечивая соблюдение принципа LSP.

## Установка и подключение

### Подключение модуля

В корневом модуле приложения (обычно `app.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database';

@Module({
  imports: [
    DatabaseModule,  // Модуль помечен как @Global()
  ],
})
export class AppModule {}
```

### Внедрение зависимости

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './modules/database';

@Injectable()
export class MyService {
  constructor(private readonly db: DatabaseService) {}

  async someMethod() {
    // Прямой доступ к Prisma Client методам
    const users = await this.db.avatar.findMany();
    return users;
  }
}
```

## Использование

### Работа с данными

`DatabaseService` предоставляет прозрачный доступ ко всем методам Prisma Client:

```typescript
@Injectable()
export class AvatarService {
  constructor(private readonly db: DatabaseService) {}

  async createAvatar(data: CreateAvatarDto) {
    return await this.db.avatar.create({ data });
  }

  async findAll() {
    return await this.db.avatar.findMany();
  }

  async findOne(id: string) {
    return await this.db.avatar.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateAvatarDto) {
    return await this.db.avatar.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return await this.db.avatar.delete({ where: { id } });
  }
}
```

### Health Check

```typescript
const isHealthy = await this.db.healthCheck();
console.log(isHealthy ? 'Database is healthy' : 'Database is down');
```

### Получение информации о БД

```typescript
const info = this.db.getDatabaseInfo();
console.log(`Driver: ${info.driver}`);      // 'sqlite' или 'postgresql'
console.log(`Connected: ${info.connected}`); // true/false
console.log(`Config:`, info.config);

// Получить тип драйвера
const driver = this.db.getDriver();
console.log(driver); // DatabaseDriver.SQLITE или DatabaseDriver.POSTGRESQL
```

### Переподключение

```typescript
try {
  await this.db.reconnect();
  console.log('Reconnected successfully');
} catch (error) {
  console.error('Reconnection failed:', error);
}
```

### Прямой доступ к активному подключению

```typescript
// Получить активное подключение
const connection = this.db.getConnection();

// Использовать напрямую
await connection.healthCheck();
```

### Транзакции

```typescript
async transferData(fromId: string, toId: string) {
  return await this.db.$transaction(async (tx) => {
    await tx.avatar.update({
      where: { id: fromId },
      data: { /* ... */ },
    });
    
    await tx.avatar.update({
      where: { id: toId },
      data: { /* ... */ },
    });
  });
}
```

### Raw SQL запросы

```typescript
// Безопасный способ с параметрами
const result = await this.db.$queryRaw`
  SELECT * FROM avatar WHERE id = ${avatarId}
`;

// Или executeRaw для UPDATE/DELETE
const affected = await this.db.$executeRaw`
  DELETE FROM avatar WHERE createdAt < ${oldDate}
`;
```

## Конфигурация

Выбор типа базы данных осуществляется через параметр `driver` в файле `settings.yaml`:

### SQLite

```yaml
app:
  database:
    driver: "sqlite"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./prisma/storage/database.sqlite"
```

### PostgreSQL

```yaml
app:
  database:
    driver: "postgresql"
    connection:
      maxRetries: 3
      retryDelay: 2000
    postgresql_params:
      host: "localhost"
      port: 5432
      database: "avatar_gen"
      username: "postgres"
      password: "password"
      ssl: false
```

## API Reference

### DatabaseService

Основной фасад-сервис для работы с базами данных.

#### Методы управления

##### `getConnection(): IDatabaseConnection`
Получение активного подключения к базе данных.

**Возвращает:** Активную реализацию провайдера БД

**Пример:**
```typescript
const connection = this.db.getConnection();
await connection.healthCheck();
```

---

##### `getDriver(): DatabaseDriver`
Получение типа активного драйвера.

**Возвращает:** `DatabaseDriver.SQLITE` или `DatabaseDriver.POSTGRESQL`

**Пример:**
```typescript
const driver = this.db.getDriver();
if (driver === DatabaseDriver.SQLITE) {
  console.log('Using SQLite');
}
```

---

##### `healthCheck(): Promise<boolean>`
Проверка состояния подключения к базе данных.

**Возвращает:** `true` если БД доступна, `false` в противном случае

**Пример:**
```typescript
if (!(await this.db.healthCheck())) {
  await this.db.reconnect();
}
```

---

##### `getDatabaseInfo(): DatabaseInfo`
Получение метаданных о подключении.

**Возвращает:**
```typescript
interface DatabaseInfo {
  driver: string;      // 'sqlite' или 'postgresql'
  connected: boolean;  // Статус подключения
  config: any;        // Конфигурация из settings.yaml
}
```

---

##### `reconnect(): Promise<void>`
Принудительное переподключение к базе данных.

**Throws:** `Error` если переподключение не удалось

**Пример:**
```typescript
try {
  await this.db.reconnect();
  this.logger.log('Reconnected successfully');
} catch (error) {
  this.logger.error('Failed to reconnect', error);
}
```

---

##### `switchDriver(newDriver: DatabaseDriver): Promise<void>`
Переключение на другой драйвер БД.

⚠️ **Внимание:** Экспериментальный метод. Требует перезапуска приложения для корректной работы.

**Параметры:**
- `newDriver` - Новый драйвер (`DatabaseDriver.SQLITE` или `DatabaseDriver.POSTGRESQL`)

**Throws:** `Error` если переключение не удалось

---

#### Методы Prisma Client

Все стандартные методы Prisma Client доступны через делегирование:

- `$connect()` - Подключение к БД
- `$disconnect()` - Отключение от БД
- `$queryRaw` - Выполнение raw SQL запросов
- `$queryRawUnsafe` - Небезопасные raw SQL запросы
- `$executeRaw` - Выполнение UPDATE/DELETE запросов
- `$executeRawUnsafe` - Небезопасные UPDATE/DELETE
- `$transaction` - Транзакции
- `$on` - Подписка на события
- `$extends` - Расширение Prisma Client

#### Доступ к моделям

Все модели Prisma доступны напрямую:

```typescript
this.db.avatar.findMany()
this.db.avatar.create({ data })
this.db.avatar.update({ where, data })
this.db.avatar.delete({ where })
```

### Интерфейс IDatabaseConnection

Контракт, который должны реализовывать все провайдеры БД.

```typescript
interface IDatabaseConnection extends PrismaClient, OnModuleInit, OnModuleDestroy {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
  healthCheck(): Promise<boolean>;
  getDatabaseInfo(): DatabaseInfo;
  reconnect(): Promise<void>;
}
```

### Enum DatabaseDriver

```typescript
enum DatabaseDriver {
  SQLITE = 'sqlite',
  POSTGRESQL = 'postgresql',
}
```

## Параметры подключения

### `maxRetries`
Максимальное количество попыток подключения при старте.

**Тип:** `number`  
**По умолчанию:** `3`  
**Диапазон:** 1-10

### `retryDelay`
Задержка между попытками подключения (в миллисекундах).

**Тип:** `number`  
**По умолчанию:** `2000`  
**Диапазон:** 100-10000

## Возможные ошибки

### 1. Database connection failed after N attempts
**Причина:** Не удалось установить соединение с базой данных.

**Решение:**
- Проверьте параметры в `settings.yaml`
- Убедитесь, что БД запущена и доступна
- Для SQLite: проверьте путь и права доступа
- Для PostgreSQL: проверьте хост, порт, credentials
- Проверьте логи для деталей

### 2. Unsupported database driver: [driver]
**Причина:** Неподдерживаемый драйвер в конфигурации.

**Решение:**
- Используйте только `'sqlite'` или `'postgresql'`
- Проверьте правильность написания

### 3. Database health check failed
**Причина:** БД не отвечает на тестовый запрос.

**Решение:**
- Проверьте, что БД запущена
- Попробуйте `reconnect()`
- Проверьте логи БД

## Best Practices

### 1. Используйте транзакции для связанных операций

```typescript
async updateMultipleRecords(updates: UpdateDto[]) {
  return await this.db.$transaction(async (tx) => {
    for (const update of updates) {
      await tx.avatar.update({
        where: { id: update.id },
        data: update.data,
      });
    }
  });
}
```

### 2. Обрабатывайте ошибки подключения

```typescript
async getData() {
  if (!(await this.db.healthCheck())) {
    try {
      await this.db.reconnect();
    } catch (error) {
      throw new ServiceUnavailableException('Database is unavailable');
    }
  }
  
  return await this.db.avatar.findMany();
}
```

### 3. Логируйте операции

```typescript
async createAvatar(data: CreateAvatarDto) {
  try {
    const avatar = await this.db.avatar.create({ data });
    this.logger.log(`Avatar created: ${avatar.id}`);
    return avatar;
  } catch (error) {
    this.logger.error(`Failed to create avatar`, error);
    throw error;
  }
}
```

### 4. Используйте select для оптимизации

```typescript
await this.db.avatar.findMany({
  select: {
    id: true,
    name: true,
    // Только нужные поля
  },
  take: 10,
});
```

## Расширение модуля

### Добавление поддержки новой БД

#### 1. Добавьте драйвер в enum

```typescript
// constants/database.constants.ts
export enum DatabaseDriver {
  SQLITE = 'sqlite',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb', // новый
}
```

#### 2. Создайте новый провайдер

```typescript
// providers/mongodb-database.service.ts
@Injectable()
export class MongoDbDatabaseService 
  extends PrismaClient 
  implements IDatabaseConnection, OnModuleInit, OnModuleDestroy 
{
  // Реализация методов интерфейса
}
```

#### 3. Обновите DatabaseService

```typescript
// database.service.ts
private selectDatabaseProvider(): IDatabaseConnection {
  switch (this.driver) {
    case DatabaseDriver.SQLITE:
      return this.sqliteService;
    case DatabaseDriver.POSTGRESQL:
      return this.postgresService;
    case DatabaseDriver.MONGODB: // добавить
      return this.mongoService;
    default:
      throw new Error(`Unsupported driver: ${this.driver}`);
  }
}
```

#### 4. Добавьте в модуль

```typescript
// database.module.ts
@Module({
  providers: [
    SqliteDatabaseService,
    PostgresDatabaseService,
    MongoDbDatabaseService, // добавить
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

## Тестирование

### Unit тесты

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { IDatabaseConnection } from './interfaces';

describe('MyService', () => {
  let service: MyService;
  let db: DatabaseService;

  beforeEach(async () => {
    const mockDb = {
      avatar: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      healthCheck: jest.fn().mockResolvedValue(true),
      getDatabaseInfo: jest.fn().mockReturnValue({
        driver: 'sqlite',
        connected: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    db = module.get<DatabaseService>(DatabaseService);
  });

  it('should fetch avatars', async () => {
    const mockAvatars = [{ id: '1', name: 'Test' }];
    jest.spyOn(db.avatar, 'findMany').mockResolvedValue(mockAvatars);

    const result = await service.getAvatars();
    expect(result).toEqual(mockAvatars);
  });
});
```

## Производительность

### Пулы подключений

- **SQLite**: использует одно подключение (file-based)
- **PostgreSQL**: Prisma автоматически управляет пулом

### Оптимизация запросов

```typescript
// Используйте select для выборки только нужных полей
await this.db.avatar.findMany({
  select: { id: true, name: true },
});

// Используйте include аккуратно
await this.db.avatar.findMany({
  include: { relatedModel: true },
});

// Пагинация
await this.db.avatar.findMany({
  take: 10,
  skip: 20,
});
```

### Индексы

Добавьте индексы в `schema.prisma`:

```prisma
model Avatar {
  id    String @id @default(uuid())
  name  String
  email String @unique
  
  @@index([name])
  @@index([email, name])
}
```

## Логирование

Каждый компонент ведет собственное логирование:
- **DatabaseService** - управление жизненным циклом, выбор провайдера
- **SqliteDatabaseService** - операции SQLite
- **PostgresDatabaseService** - операции PostgreSQL

**Уровни логов:**
- **LOG** - успешные операции
- **DEBUG** - отладочная информация (выбор провайдера)
- **WARN** - предупреждения
- **ERROR** - ошибки

**Пример:**
```
[DatabaseService] LOG Database service initialized with driver: sqlite
[DatabaseService] DEBUG Selected SQLite database provider
[DatabaseService] LOG Initializing database connection...
[SqliteDatabaseService] LOG SQLite database connected successfully on attempt 1
```

## Миграция

См. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) для подробных инструкций по миграции с предыдущих версий.

## История изменений

См. [CHANGELOG_MODULE.md](./CHANGELOG_MODULE.md) для полной истории изменений модуля.
