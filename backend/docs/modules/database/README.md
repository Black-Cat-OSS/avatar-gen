# Database Module

Модуль для работы с базой данных, использующий TypeORM для взаимодействия с различными типами баз данных.

## Возможности

- **Множественные драйверы**: Поддержка PostgreSQL и SQLite
- **Автоматическая синхронизация**: Схема базы данных синхронизируется автоматически
- **Конфигурация через YAML**: Настройки базы данных через конфигурационные файлы
- **Health Check**: Встроенная проверка состояния подключения
- **Миграции**: Поддержка миграций базы данных

## Архитектура

```
src/modules/database/
├── drivers/            # Драйверы баз данных
│   ├── postgresql/     # PostgreSQL драйвер
│   │   ├── postgresql-driver.service.ts
│   │   ├── postgresql-driver.service.spec.ts
│   │   └── index.ts
│   ├── sqlite/         # SQLite драйвер
│   │   ├── sqlite-driver.service.ts
│   │   ├── sqlite-driver.service.spec.ts
│   │   └── index.ts
│   └── index.ts
├── interfaces/         # Интерфейсы
│   ├── driver.ts       # Интерфейс драйверов
│   ├── configs.ts      # Конфигурации TypeORM
│   └── index.ts
├── utils/              # Утилиты
│   ├── config-factory.ts    # Фабрика конфигураций
│   ├── driver-factory.ts    # Фабрика драйверов
│   └── index.ts
├── database.service.ts # Основной сервис для работы с БД
├── database.module.ts  # Модуль конфигурации TypeORM
└── index.ts
```

## Использование

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
    return await this.avatarRepository.find();
  }

  async create(data: Partial<Avatar>): Promise<Avatar> {
    const avatar = this.avatarRepository.create(data);
    return await this.avatarRepository.save(avatar);
  }
}
```

### Использование DatabaseService

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SomeService {
  constructor(private readonly db: DatabaseService) {}

  async healthCheck() {
    return await this.db.healthCheck();
  }

  async getDatabaseInfo() {
    return this.db.getDatabaseInfo();
  }
}
```

### Health Check

```typescript
const isHealthy = await this.db.healthCheck();
```

### Информация о базе данных

```typescript
const dbInfo = this.db.getDatabaseInfo();
console.log(`Driver: ${dbInfo.driver}`);
console.log(`Connected: ${dbInfo.isConnected}`);
```

## Конфигурация

### PostgreSQL

```yaml
app:
  database:
    driver: postgresql
    network:
      host: localhost
      port: 5432
      username: postgres
      password: password
      database: avatar_gen
      ssl: false
```

### SQLite

```yaml
app:
  database:
    driver: sqlite
    sqlite_params:
      url: 'file:./storage/database/avatar_gen.db'
```

## Миграции

### Создание миграции

```bash
npm run typeorm:generate -- src/migrations/InitialMigration
```

### Запуск миграций

```bash
npm run typeorm:run
```

### Откат миграции

```bash
npm run typeorm:revert
```

## Преимущества TypeORM

1. **Простота настройки**: Не требует .env файлов
2. **Множественные драйверы**: Легкое переключение между БД
3. **Автоматическая синхронизация**: Схема создается автоматически
4. **Встроенные миграции**: Управление изменениями схемы
5. **NestJS интеграция**: Нативная поддержка NestJS

## Драйверы баз данных

Модуль поддерживает систему драйверов для различных типов баз данных. Каждый драйвер реализует интерфейс `IDataBaseDriver` и отвечает за создание конфигурации TypeORM для конкретного типа базы данных.

**Документация:** [Database Drivers](./DRIVERS.md)

### Доступные драйверы

- **SQLite** - для разработки и тестирования
- **PostgreSQL** - для production окружения

### Фабрика драйверов

`DatabaseDriverFactory` автоматически выбирает нужный драйвер на основе конфигурации:

```typescript
// Автоматический выбор драйвера
const driver = driverFactory.createDriver(configService);
const config = driver.buildConfigs(configService);
```

### Структура драйверов

Каждый драйвер находится в отдельной папке и содержит:
- **Сервис драйвера** - основная логика конфигурации
- **Тесты** - полное покрытие тестами
- **Index.ts** - экспорты модуля

**Пример структуры PostgreSQL драйвера:**
```
drivers/postgresql/
├── postgresql-driver.service.ts      # Основной сервис
├── postgresql-driver.service.spec.ts # Тесты
└── index.ts                          # Экспорты
```

## TypeORM Integration

### Архитектура

- Использует TypeORM для работы с базами данных
- Поддержка PostgreSQL и SQLite драйверов
- Автоматическая синхронизация схемы
- Конфигурация через YAML файлы
- Система драйверов для разных БД

### Особенности

- Все API остались совместимыми
- Репозитории для работы с сущностями
- Конфигурация через YAML сохранена
- Гибкая система выбора драйверов
