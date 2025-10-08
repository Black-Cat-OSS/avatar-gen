# Database Module - TypeORM Integration Guide

Руководство по использованию TypeORM в Database Module.

## Архитектура

### Паттерн Facade

Модуль использует паттерн **Facade** с `DatabaseService` в роли управляющего сервиса:

```
┌─────────────────────────────────────┐
│      DatabaseService (Facade)      │
│  - Выбор драйвера БД               │
│  - Управление подключениями        │
│  - Делегирование операций          │
└─────────────┬───────────────────────┘
              │
       ┌──────┴──────┐
       │             │
┌──────▼──────┐ ┌───▼─────────────┐
│   SQLite    │ │   PostgreSQL    │
│  Driver     │ │    Driver       │
└─────────────┘ └─────────────────┘
```

### Преимущества

1. **Единая точка доступа** - `DatabaseService` для всех операций
2. **Упрощенное использование** - не нужны сложные конфигурации
3. **Прозрачное делегирование** - все методы TypeORM доступны напрямую
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

### В сервисах

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from '../avatar/avatar.entity';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
  ) {}

  async findAll(): Promise<Avatar[]> {
    return this.avatarRepository.find();
  }

  async create(data: Partial<Avatar>): Promise<Avatar> {
    const avatar = this.avatarRepository.create(data);
    return this.avatarRepository.save(avatar);
  }
}
```

## Конфигурация

### YAML настройки

```yaml
# settings.yaml
database:
  driver: sqlite # или postgresql
  sqlite:
    database: storage/database/avatar-gen.db
  postgresql:
    host: localhost
    port: 5432
    database: avatar_gen
    username: postgres
    password: password
```

### Переменные окружения

```bash
# SQLite
DB_DRIVER=sqlite
DB_DATABASE=storage/database/avatar-gen.db

# PostgreSQL
DB_DRIVER=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=avatar_gen
DB_USERNAME=postgres
DB_PASSWORD=password
```

## Драйверы

### SQLite Driver

```typescript
// Автоматически выбирается при DB_DRIVER=sqlite
import { DatabaseService } from './modules/database';

@Injectable()
export class MyService {
  constructor(private readonly database: DatabaseService) {}
  
  async getAvatars() {
    // TypeORM автоматически использует SQLite
    return this.database.avatar.findMany();
  }
}
```

### PostgreSQL Driver

```typescript
// Автоматически выбирается при DB_DRIVER=postgresql
import { DatabaseService } from './modules/database';

@Injectable()
export class MyService {
  constructor(private readonly database: DatabaseService) {}
  
  async getAvatars() {
    // TypeORM автоматически использует PostgreSQL
    return this.database.avatar.findMany();
  }
}
```

## Сущности

### Создание сущности

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('avatars')
export class Avatar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Регистрация в модуле

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './avatar/avatar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avatar]),
  ],
})
export class AvatarModule {}
```

## Миграции

### Создание миграции

```bash
# TypeORM CLI команды
npx typeorm migration:generate -n CreateAvatarTable
npx typeorm migration:run
```

### Автоматическая синхронизация

В режиме разработки схема синхронизируется автоматически:

```typescript
// database.module.ts
TypeOrmModule.forRoot({
  synchronize: process.env.NODE_ENV !== 'production',
  // ... остальная конфигурация
})
```

## Тестирование

### Unit тесты

```typescript
describe('AvatarService', () => {
  let service: AvatarService;
  let repository: Repository<Avatar>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: getRepositoryToken(Avatar),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
    repository = module.get<Repository<Avatar>>(getRepositoryToken(Avatar));
  });

  it('should return all avatars', async () => {
    const avatars = [{ id: '1', name: 'test' }];
    jest.spyOn(repository, 'find').mockResolvedValue(avatars);

    expect(await service.findAll()).toEqual(avatars);
  });
});
```

### Integration тесты

```typescript
describe('Database Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        avatar: {
          findMany: jest.fn(),
          create: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/avatars (GET)', () => {
    return request(app.getHttpServer())
      .get('/avatars')
      .expect(200);
  });
});
```

## Troubleshooting

### Частые проблемы

1. **Ошибка подключения к БД**
   - Проверьте настройки в YAML файле
   - Убедитесь что драйвер установлен
   - Проверьте права доступа к файлу БД

2. **Сущность не найдена**
   - Убедитесь что сущность зарегистрирована в модуле
   - Проверьте импорты в TypeOrmModule.forFeature()

3. **Миграции не применяются**
   - Используйте `synchronize: true` для разработки
   - Запустите миграции вручную: `npx typeorm migration:run`

### Логирование

```typescript
// Включить логи TypeORM
TypeOrmModule.forRoot({
  logging: process.env.NODE_ENV === 'development',
  // ... остальная конфигурация
})
```

## Миграция с других ORM

### Из Prisma

1. Замените `@prisma/client` на TypeORM
2. Конвертируйте Prisma схемы в TypeORM сущности
3. Обновите репозитории для использования TypeORM
4. Настройте конфигурацию в YAML

### Из других ORM

1. Создайте TypeORM сущности
2. Настройте подключение к БД
3. Обновите сервисы для использования TypeORM репозиториев
4. Протестируйте миграцию данных