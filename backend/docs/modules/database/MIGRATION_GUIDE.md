# Database Module - Migration Guide

Руководство по использованию нового архитектурного подхода Database Module.

## Новая архитектура

### Паттерн Facade

Модуль теперь использует паттерн **Facade** с `DatabaseService` в роли управляющего сервиса:

```
┌─────────────────────────────────────┐
│      DatabaseService (Facade)      │
│  - Выбор реализации                │
│  - Управление жизненным циклом     │
│  - Делегирование операций          │
└─────────────┬───────────────────────┘
              │
       ┌──────┴──────┐
       │             │
┌──────▼──────┐ ┌───▼─────────────┐
│   SQLite    │ │   PostgreSQL    │
│  Provider   │ │    Provider     │
└─────────────┘ └─────────────────┘
```

### Преимущества

1. **Единая точка доступа** - `DatabaseService` вместо токенов
2. **Упрощенное использование** - не нужны `@Inject()` декораторы
3. **Прозрачное делегирование** - все методы Prisma доступны напрямую
4. **Легкая тестируемость** - простое моккирование сервиса
5. **Соответствие принципам** - Facade, LSP, DRY

## Использование

### Подключение модуля

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database';

@Module({
  imports: [
    DatabaseModule, // Просто импортируйте модуль
  ],
})
export class AppModule {}
```

### Внедрение в сервисах

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './modules/database';

@Injectable()
export class AvatarService {
  constructor(private readonly db: DatabaseService) {}

  async getAvatars() {
    return await this.db.avatar.findMany();
  }

  async createAvatar(data: CreateAvatarDto) {
    return await this.db.avatar.create({ data });
  }
}
```

### Работа с данными

```typescript
// CRUD операции
const avatar = await this.db.avatar.create({ data });
const avatars = await this.db.avatar.findMany();
const avatar = await this.db.avatar.findUnique({ where: { id } });
const updated = await this.db.avatar.update({ where: { id }, data });
const deleted = await this.db.avatar.delete({ where: { id } });

// Транзакции
await this.db.$transaction(async (tx) => {
  await tx.avatar.create({ data: data1 });
  await tx.avatar.create({ data: data2 });
});

// Raw SQL
const result = await this.db.$queryRaw`SELECT * FROM avatar`;

// Health Check
const isHealthy = await this.db.healthCheck();

// Информация о БД
const info = this.db.getDatabaseInfo();
const driver = this.db.getDriver();
```

## Архитектурные компоненты

### 1. DatabaseService (Facade)

Основной управляющий сервис:

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    private readonly configService: YamlConfigService,
    private readonly sqliteService: SqliteDatabaseService,
    private readonly postgresService: PostgresDatabaseService,
  ) {
    // Автоматический выбор провайдера на основе конфигурации
    this.activeConnection = this.selectDatabaseProvider();
  }

  // Делегирование операций активному провайдеру
  get avatar() {
    return this.activeConnection.avatar;
  }
}
```

**Обязанности:**
- Выбор правильного провайдера на основе `settings.yaml`
- Делегирование всех операций активному подключению
- Управление жизненным циклом (init/destroy)
- Предоставление API для управления (healthCheck, reconnect)

### 2. Провайдеры (SqliteDatabaseService, PostgresDatabaseService)

Конкретные реализации для каждой БД:

```typescript
@Injectable()
export class SqliteDatabaseService 
  extends PrismaClient 
  implements IDatabaseConnection, OnModuleInit, OnModuleDestroy 
{
  async onModuleInit() {
    await this.connectWithRetry();
  }

  async healthCheck() {
    await this.$queryRaw`SELECT 1`;
    return true;
  }
  
  // ... другие методы
}
```

**Обязанности:**
- Реализация интерфейса `IDatabaseConnection`
- Логика подключения с повторными попытками
- Специфичные для БД операции
- Логирование операций

### 3. Интерфейс IDatabaseConnection

Контракт для всех провайдеров:

```typescript
interface IDatabaseConnection extends PrismaClient {
  onModuleInit(): Promise<void>;
  onModuleDestroy(): Promise<void>;
  healthCheck(): Promise<boolean>;
  getDatabaseInfo(): DatabaseInfo;
  reconnect(): Promise<void>;
}
```

## Сравнение с предыдущими версиями

### v1.0 - Один сервис для всех БД

```typescript
// database.service.ts содержал всю логику
@Injectable()
export class DatabaseService extends PrismaClient {
  async healthCheck() {
    const driver = this.config.app.database.driver;
    if (driver === 'sqlite') {
      // логика для SQLite
    } else if (driver === 'postgresql') {
      // логика для PostgreSQL
    }
  }
}
```

**Проблемы:**
- ❌ Нарушение Single Responsibility Principle
- ❌ Сложность добавления новых БД
- ❌ Смешивание логики разных БД

### v2.0 - Токены и Factory Provider

```typescript
// Использование токенов
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

// Factory provider в модуле
{
  provide: DATABASE_CONNECTION,
  useFactory: (config, sqlite, postgres) => {
    return config.driver === 'sqlite' ? sqlite : postgres;
  },
}

// Использование в сервисах
constructor(
  @Inject(DATABASE_CONNECTION) private db: IDatabaseConnection
) {}
```

**Проблемы:**
- ❌ Сложность использования (нужен @Inject)
- ❌ Verbose код
- ❌ Сложность для новичков в NestJS

### v3.0 (Текущая) - Facade Pattern

```typescript
// DatabaseService как фасад
@Injectable()
export class DatabaseService {
  constructor(
    private readonly sqliteService: SqliteDatabaseService,
    private readonly postgresService: PostgresDatabaseService,
  ) {
    this.activeConnection = this.selectDatabaseProvider();
  }
}

// Простое использование
constructor(private readonly db: DatabaseService) {}
```

**Преимущества:**
- ✅ Простота использования
- ✅ Чистый код
- ✅ Легкая расширяемость
- ✅ Соответствие принципам SOLID

## Примеры использования

### Базовые операции

```typescript
@Injectable()
export class AvatarService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateAvatarDto) {
    return await this.db.avatar.create({
      data: {
        name: dto.name,
        primaryColor: dto.primaryColor,
        foreignColor: dto.foreignColor,
      },
    });
  }

  async findAll(pick: number, offset: number) {
    const [avatars, total] = await Promise.all([
      this.db.avatar.findMany({
        take: pick,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.avatar.count(),
    ]);

    return { avatars, total };
  }

  async findOne(id: string) {
    const avatar = await this.db.avatar.findUnique({
      where: { id },
    });

    if (!avatar) {
      throw new NotFoundException(`Avatar ${id} not found`);
    }

    return avatar;
  }
}
```

### Транзакции

```typescript
async createAvatarWithMetadata(dto: CreateAvatarDto) {
  return await this.db.$transaction(async (tx) => {
    const avatar = await tx.avatar.create({
      data: {
        name: dto.name,
        primaryColor: dto.primaryColor,
      },
    });

    await tx.avatarMetadata.create({
      data: {
        avatarId: avatar.id,
        description: dto.description,
      },
    });

    return avatar;
  });
}
```

### Health Checks

```typescript
@Injectable()
export class HealthService {
  constructor(private readonly db: DatabaseService) {}

  async check() {
    const dbHealthy = await this.db.healthCheck();
    const info = this.db.getDatabaseInfo();
    const driver = this.db.getDriver();

    return {
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        driver,
        connected: info.connected,
      },
    };
  }
}
```

### Обработка ошибок

```typescript
@Injectable()
export class AvatarService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: Logger,
  ) {}

  async createAvatar(dto: CreateAvatarDto) {
    try {
      // Проверка подключения
      if (!(await this.db.healthCheck())) {
        this.logger.warn('Database unhealthy, attempting reconnect');
        await this.db.reconnect();
      }

      const avatar = await this.db.avatar.create({ data: dto });
      this.logger.log(`Avatar created: ${avatar.id}`);
      
      return avatar;
    } catch (error) {
      this.logger.error(`Failed to create avatar`, error);
      
      if (error.code === 'P2002') {
        throw new ConflictException('Avatar already exists');
      }
      
      throw new InternalServerErrorException('Failed to create avatar');
    }
  }
}
```

## Тестирование

### Unit тесты

```typescript
describe('AvatarService', () => {
  let service: AvatarService;
  let db: DatabaseService;

  beforeEach(async () => {
    // Mock DatabaseService
    const mockDb = {
      avatar: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      healthCheck: jest.fn().mockResolvedValue(true),
      getDatabaseInfo: jest.fn().mockReturnValue({
        driver: 'sqlite',
        connected: true,
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get(AvatarService);
    db = module.get(DatabaseService);
  });

  it('should create avatar', async () => {
    const dto = { name: 'Test', primaryColor: '#fff' };
    const expected = { id: '1', ...dto };

    jest.spyOn(db.avatar, 'create').mockResolvedValue(expected);

    const result = await service.create(dto);

    expect(result).toEqual(expected);
    expect(db.avatar.create).toHaveBeenCalledWith({
      data: dto,
    });
  });
});
```

### Integration тесты

```typescript
describe('AvatarService (integration)', () => {
  let service: AvatarService;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule, AvatarModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get(AvatarService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve avatar', async () => {
    const dto = { name: 'Test', primaryColor: '#fff' };
    
    const created = await service.create(dto);
    expect(created.id).toBeDefined();

    const retrieved = await service.findOne(created.id);
    expect(retrieved).toEqual(created);
  });
});
```

## Best Practices

### 1. Всегда используйте DatabaseService

```typescript
// ✅ Правильно
constructor(private readonly db: DatabaseService) {}

// ❌ Неправильно - не используйте провайдеры напрямую
constructor(private readonly sqlite: SqliteDatabaseService) {}
```

### 2. Обрабатывайте ошибки подключения

```typescript
async getData() {
  if (!(await this.db.healthCheck())) {
    try {
      await this.db.reconnect();
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
  
  return await this.db.avatar.findMany();
}
```

### 3. Используйте транзакции для связанных операций

```typescript
// ✅ Правильно - атомарная операция
await this.db.$transaction(async (tx) => {
  await tx.avatar.create({ data: avatar1 });
  await tx.avatar.create({ data: avatar2 });
});

// ❌ Неправильно - не атомарно
await this.db.avatar.create({ data: avatar1 });
await this.db.avatar.create({ data: avatar2 });
```

### 4. Логируйте важные операции

```typescript
async createAvatar(dto: CreateAvatarDto) {
  try {
    const avatar = await this.db.avatar.create({ data: dto });
    this.logger.log(`Avatar created: ${avatar.id}`);
    return avatar;
  } catch (error) {
    this.logger.error('Failed to create avatar', error);
    throw error;
  }
}
```

## Частые вопросы

### Как получить прямой доступ к PrismaClient?

```typescript
const connection = this.db.getConnection();
// connection - это SqliteDatabaseService или PostgresDatabaseService
```

### Можно ли использовать несколько БД одновременно?

Нет, в текущей версии поддерживается только одна активная БД. Для множественных БД нужно создать отдельные модули.

### Как добавить новую модель в Prisma?

1. Обновите `schema.prisma`
2. Выполните `npx prisma generate`
3. Добавьте геттер в `DatabaseService`:

```typescript
get newModel() {
  return this.activeConnection.newModel;
}
```

### Нужно ли обновлять тесты?

Да, но изменения минимальны - просто замените моки токенов на моки `DatabaseService`.

## Получение помощи

1. Проверьте [README.md](./README.md) для полной документации
2. Посмотрите примеры в `avatar.service.ts`
3. Проверьте логи приложения
4. Создайте issue с описанием проблемы
