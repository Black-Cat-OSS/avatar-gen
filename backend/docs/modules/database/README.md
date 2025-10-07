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
├── entities/           # TypeORM сущности
│   └── avatar.entity.ts
├── database.service.ts # Основной сервис для работы с БД
└── database.module.ts  # Модуль конфигурации TypeORM
```

## Использование

### В сервисах

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AvatarService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Avatar[]> {
    return await this.db.avatar.find();
  }

  async create(data: Partial<Avatar>): Promise<Avatar> {
    const avatar = this.db.avatar.create(data);
    return await this.db.avatar.save(avatar);
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
      url: "file:./storage/database/avatar_gen.db"
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

## Миграция с Prisma

### Что изменилось

- Удален `@prisma/client` и `prisma` пакеты
- Удалены Prisma схемы и миграции
- Упрощен `start.sh` скрипт
- Добавлены TypeORM сущности и конфигурация

### Совместимость

- Все API остались совместимыми
- Репозитории работают аналогично Prisma
- Конфигурация через YAML сохранена