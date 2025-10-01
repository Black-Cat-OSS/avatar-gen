# Database Module Changelog

## [3.0.0] - 2025-10-01

### 🎉 Major Architectural Refactoring - Facade Pattern

Полная переработка архитектуры модуля с использованием паттерна Facade для упрощения использования и улучшения поддерживаемости.

### ✨ Added

#### DatabaseService как Facade
- **Новая роль**: DatabaseService теперь управляющий сервис (фасад)
- **Автоматический выбор**: Автоматически выбирает нужный провайдер на основе конфигурации
- **Делегирование**: Прозрачное делегирование всех операций активному подключению
- **API управления**: Методы для получения информации и управления подключением

#### Новые методы DatabaseService
```typescript
getConnection(): IDatabaseConnection  // Получить активное подключение
getDriver(): DatabaseDriver          // Получить тип драйвера
switchDriver(driver): Promise<void>  // Переключить драйвер (экспериментально)
```

#### Улучшенная архитектура
```
DatabaseService (Facade)
    ↓
    ├─ SqliteDatabaseService (Provider)
    └─ PostgresDatabaseService (Provider)
```

### 🔄 Changed

#### DatabaseService - полная переработка
**Было:** Extends PrismaClient, содержал всю логику для всех БД
```typescript
export class DatabaseService extends PrismaClient {
  async healthCheck() {
    const driver = this.config.app.database.driver;
    if (driver === 'sqlite') { /* ... */ }
    else if (driver === 'postgresql') { /* ... */ }
  }
}
```

**Стало:** Фасад с делегированием
```typescript
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private activeConnection: IDatabaseConnection;
  
  constructor(
    private readonly sqliteService: SqliteDatabaseService,
    private readonly postgresService: PostgresDatabaseService,
  ) {
    this.activeConnection = this.selectDatabaseProvider();
  }
  
  async healthCheck() {
    return await this.activeConnection.healthCheck();
  }
}
```

#### DatabaseModule - упрощен
**Было:** Использовал factory provider с токенами
```typescript
@Module({
  providers: [
    SqliteDatabaseService,
    PostgresDatabaseService,
    {
      provide: DATABASE_CONNECTION,
      useFactory: (config, sqlite, postgres) => {
        return config.driver === 'sqlite' ? sqlite : postgres;
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
```

**Стало:** Простой модуль
```typescript
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SqliteDatabaseService,
    PostgresDatabaseService,
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

#### Использование в сервисах
**Было:** Требовался @Inject с токеном
```typescript
constructor(
  @Inject(DATABASE_CONNECTION) private readonly db: IDatabaseConnection
) {}
```

**Стало:** Прямое внедрение
```typescript
constructor(private readonly db: DatabaseService) {}
```

#### Импорт модуля
**Было:** Динамический модуль
```typescript
@Module({
  imports: [DatabaseModule.forRoot()],
})
```

**Стало:** Обычный импорт
```typescript
@Module({
  imports: [DatabaseModule],
})
```

### 🗑️ Removed

- ❌ `DATABASE_CONNECTION` токен (больше не нужен)
- ❌ `forRoot()` метод в DatabaseModule
- ❌ Factory provider для выбора БД
- ❌ Наследование от PrismaClient в DatabaseService

### 📝 Documentation

#### Обновлена документация
- **README.md** - Полная переработка с новыми примерами
- **MIGRATION_GUIDE.md** - Новое руководство для v3.0
- **CHANGELOG_MODULE.md** - Этот файл обновлен

#### Новые разделы в документации
- Архитектура Facade Pattern
- Сравнение версий (v1.0, v2.0, v3.0)
- Расширенные примеры использования
- Best practices для новой архитектуры

### 🏗️ Architecture

#### Паттерны проектирования

1. **Facade Pattern**
   - DatabaseService скрывает сложность выбора провайдера
   - Предоставляет упрощенный интерфейс
   - Делегирует операции конкретным реализациям

2. **Strategy Pattern**
   - Провайдеры как стратегии
   - Выбор стратегии на основе конфигурации
   - Взаимозаменяемость реализаций

3. **Dependency Injection**
   - Все зависимости внедряются через конструктор
   - Легкое тестирование и моккирование

#### Принципы SOLID

- ✅ **Single Responsibility**: Каждый компонент имеет одну ответственность
  - DatabaseService - управление и делегирование
  - Провайдеры - специфичная логика БД
  
- ✅ **Open/Closed**: Легко добавлять новые БД без изменения существующего кода

- ✅ **Liskov Substitution**: Все провайдеры взаимозаменяемы через IDatabaseConnection

- ✅ **Interface Segregation**: Четкий интерфейс IDatabaseConnection

- ✅ **Dependency Inversion**: Зависимость от абстракций (IDatabaseConnection)

### 🔧 Technical Details

#### Делегирование методов
DatabaseService делегирует все вызовы через геттеры:

```typescript
get avatar() {
  return this.activeConnection.avatar;
}

get $queryRaw() {
  return this.activeConnection.$queryRaw.bind(this.activeConnection);
}
```

#### Выбор провайдера
Выбор происходит в конструкторе на основе конфигурации:

```typescript
private selectDatabaseProvider(): IDatabaseConnection {
  switch (this.driver) {
    case DatabaseDriver.SQLITE:
      return this.sqliteService;
    case DatabaseDriver.POSTGRESQL:
      return this.postgresService;
    default:
      throw new Error(`Unsupported driver: ${this.driver}`);
  }
}
```

### 🚀 Migration Path

#### Шаг 1: Обновить AppModule
```typescript
// Удалить .forRoot()
DatabaseModule // вместо DatabaseModule.forRoot()
```

#### Шаг 2: Обновить сервисы
```typescript
// Удалить @Inject и токен
constructor(private readonly db: DatabaseService) {}
```

#### Шаг 3: Обновить тесты
```typescript
// Мокировать DatabaseService напрямую
{
  provide: DatabaseService,
  useValue: mockDb,
}
```

### ⚡ Performance

- ✅ Без изменений производительности
- ✅ Та же логика подключения
- ✅ Те же механизмы retry
- ✅ Делегирование через геттеры практически без overhead

### 🐛 Bug Fixes

Нет bug fixes в этом релизе - только архитектурные улучшения.

### ⚠️ Breaking Changes

#### 1. Использование модуля
```typescript
// ❌ Старый способ
DatabaseModule.forRoot()

// ✅ Новый способ
DatabaseModule
```

#### 2. Внедрение зависимости
```typescript
// ❌ Старый способ
@Inject(DATABASE_CONNECTION) private readonly db: IDatabaseConnection

// ✅ Новый способ
private readonly db: DatabaseService
```

#### 3. Экспорты модуля
```typescript
// ❌ Удалено
import { DATABASE_CONNECTION } from './modules/database';

// ✅ Используйте
import { DatabaseService } from './modules/database';
```

### 📊 Benefits

#### Для разработчиков
1. **Простота использования** - нет сложных токенов и декораторов
2. **Читаемость кода** - очевидное внедрение зависимостей
3. **Легкость тестирования** - простое моккирование
4. **IntelliSense** - полная поддержка автодополнения

#### Для архитектуры
1. **Соответствие SOLID** - все принципы соблюдены
2. **Паттерн Facade** - скрывает сложность
3. **Расширяемость** - легко добавлять новые БД
4. **Поддерживаемость** - четкое разделение ответственности

#### Для производительности
1. **Без overhead** - делегирование практически бесплатно
2. **Та же логика** - не изменилась внутренняя работа
3. **Оптимизация** - можно кэшировать геттеры при необходимости

### 🧪 Testing

#### Unit тесты стали проще
```typescript
// Было
const module = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: DATABASE_CONNECTION,
      useValue: mockDb,
    },
  ],
}).compile();

// Стало
const module = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: DatabaseService,
      useValue: mockDb,
    },
  ],
}).compile();
```

### 🔜 Future Plans

#### v3.1.0 (Планируется)
- [ ] Поддержка множественных БД одновременно
- [ ] Кэширование результатов запросов
- [ ] Метрики и мониторинг

#### v3.2.0 (Планируется)
- [ ] MongoDB provider
- [ ] Redis provider для кэширования
- [ ] Автоматическое переключение при сбое (failover)

#### v4.0.0 (Будущее)
- [ ] Удаление deprecated кода
- [ ] Поддержка Prisma v6+
- [ ] Распределенные транзакции

### 📚 Resources

- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## [2.0.0] - 2025-10-01

### 🎉 Major Refactoring - NestJS Best Practices

Реорганизация модуля в соответствии с официальными рекомендациями NestJS.

### ✨ Added

- **constants/** - Токены и константы для DI
- **providers/** - Провайдеры баз данных
- **Динамический модуль** - `DatabaseModule.forRoot()` паттерн
- **Symbol токен** - `DATABASE_CONNECTION`
- **Enum для драйверов** - `DatabaseDriver`

### 🔄 Changed

- **Переименование**: `modules/` → `providers/`
- **Токен**: `DATABASE_SERVICE` (string) → `DATABASE_CONNECTION` (Symbol)
- **Модуль**: Статический → Динамический

### 📝 Documentation

- Расширенная документация
- Руководство по миграции
- API Reference

---

## [1.0.0] - 2025-09-25

### 🎉 Initial Release

Первая версия модуля базы данных.

### ✨ Features

- Поддержка SQLite
- Поддержка PostgreSQL
- Механизм retry для подключения
- Health check
- Базовое логирование

---

## Семантическое версионирование

Этот модуль следует [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0) - Несовместимые изменения API
- **MINOR** (0.X.0) - Новая функциональность (обратно совместимая)
- **PATCH** (0.0.X) - Исправления ошибок

## Обратная связь

Если вы обнаружили проблему или хотите предложить улучшение:
1. Создайте issue в репозитории
2. Опишите проблему и приложите логи
3. Предложите решение (опционально)
