# Database Drivers

Система драйверов баз данных позволяет динамически выбирать и настраивать TypeORM для работы с различными базами данных на основе конфигурации.

## 🏗️ Архитектура

```
DatabaseModule
├── DatabaseDriverFactory (фабрика драйверов)
├── SqliteDriverService (драйвер SQLite)
└── PostgreSQLDriverService (драйвер PostgreSQL)
```

## 🔧 Интерфейс IDataBaseDriver

Все драйверы реализуют интерфейс `IDataBaseDriver`:

```typescript
interface IDataBaseDriver {
  buildConfigs(configService: YamlConfigService): TypeOrmConfig;
  getDriverName(): string;
}
```

### Методы

- **`buildConfigs()`** - создает конфигурацию TypeORM для конкретного драйвера
- **`getDriverName()`** - возвращает имя драйвера

## 📦 Доступные драйверы

### SQLite Driver

**Класс:** `SqliteDriverService`

**Конфигурация:**

```yaml
app:
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
```

**Особенности:**

- Автоматическая синхронизация схемы (`synchronize: true`)
- Простая настройка через URL файла
- Подходит для разработки и тестирования

### PostgreSQL Driver

**Класс:** `PostgreSQLDriverService`

**Конфигурация:**

```yaml
app:
  database:
    driver: 'postgresql'
    network:
      host: 'localhost'
      port: 5432
      database: 'avatar_gen'
      username: 'postgres'
      password: 'password'
      ssl: false
```

**Особенности:**

- Отключенная синхронизация схемы (`synchronize: false`)
- Поддержка SSL соединений
- Подходит для production окружения

## 🏭 Фабрика драйверов

**Класс:** `DatabaseDriverFactory`

### Методы

#### `createDriver(configService: YamlConfigService): IDataBaseDriver`

Создает драйвер на основе конфигурации:

```typescript
const driver = driverFactory.createDriver(configService);
const config = driver.buildConfigs(configService);
```

#### `getAllDrivers(): IDataBaseDriver[]`

Возвращает все доступные драйверы:

```typescript
const drivers = driverFactory.getAllDrivers();
// [SqliteDriverService, PostgreSQLDriverService]
```

#### `getDriverByName(driverName: string): IDataBaseDriver | undefined`

Получает драйвер по имени:

```typescript
const sqliteDriver = driverFactory.getDriverByName('sqlite');
const postgresDriver = driverFactory.getDriverByName('postgresql');
```

## 🚀 Использование

### Автоматическое использование

Драйверы автоматически инициализируются в `DatabaseModule`:

```typescript
// В DatabaseModule
TypeOrmModule.forRootAsync({
  useFactory: (configService: YamlConfigService, driverFactory: DatabaseDriverFactory) => {
    // Создаем драйвер на основе конфигурации
    const driver = driverFactory.createDriver(configService);

    // Строим конфигурацию через драйвер
    const typeormConfig = driver.buildConfigs(configService);

    // Добавляем сущности
    typeormConfig.entities = [Avatar];

    return typeormConfig;
  },
  inject: [YamlConfigService, DatabaseDriverFactory],
});
```

### Ручное использование

```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly driverFactory: DatabaseDriverFactory,
    private readonly configService: YamlConfigService,
  ) {}

  async getDatabaseInfo() {
    const driver = this.driverFactory.createDriver(this.configService);
    const config = driver.buildConfigs(this.configService);

    return {
      driver: driver.getDriverName(),
      config: config,
    };
  }
}
```

## 🔄 Процесс выбора драйвера

1. **Чтение конфигурации** - `DatabaseDriverFactory` читает `driver` из `settings.yaml`
2. **Выбор драйвера** - на основе значения `driver` выбирается соответствующий сервис
3. **Построение конфигурации** - драйвер создает конфигурацию TypeORM
4. **Инициализация TypeORM** - конфигурация передается в `TypeOrmModule`

## 📝 Логирование

Каждый драйвер ведет подробное логирование:

```
[SqliteDriverService] Building SQLite TypeORM configuration
[SqliteDriverService] SQLite configuration built: database=./storage/database/database.sqlite
[DatabaseDriverFactory] Creating database driver: sqlite
[DatabaseDriverFactory] Using SQLite database driver
```

## 🧪 Тестирование

### Unit тесты драйверов

```typescript
describe('SqliteDriverService', () => {
  let service: SqliteDriverService;
  let configService: YamlConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SqliteDriverService,
        {
          provide: YamlConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get(SqliteDriverService);
    configService = module.get(YamlConfigService);
  });

  it('should build SQLite configuration', () => {
    const config = service.buildConfigs(configService);

    expect(config.type).toBe('sqlite');
    expect(config.database).toBe('./storage/database/database.sqlite');
    expect(config.synchronize).toBe(true);
  });

  it('should return correct driver name', () => {
    expect(service.getDriverName()).toBe('sqlite');
  });
});
```

### Интеграционные тесты

```typescript
describe('DatabaseDriverFactory', () => {
  let factory: DatabaseDriverFactory;
  let configService: YamlConfigService;

  it('should create SQLite driver for sqlite config', () => {
    const driver = factory.createDriver(configService);
    expect(driver).toBeInstanceOf(SqliteDriverService);
  });

  it('should create PostgreSQL driver for postgresql config', () => {
    const driver = factory.createDriver(postgresqlConfigService);
    expect(driver).toBeInstanceOf(PostgreSQLDriverService);
  });
});
```

## 🔧 Расширение системы

### Добавление нового драйвера

1. **Создайте новый сервис драйвера:**

```typescript
@Injectable()
export class MySQLDriverService implements IDataBaseDriver {
  buildConfigs(configService: YamlConfigService): TypeOrmConfig {
    // Реализация для MySQL
  }

  getDriverName(): string {
    return 'mysql';
  }
}
```

2. **Обновите фабрику:**

```typescript
@Injectable()
export class DatabaseDriverFactory {
  constructor(
    private readonly sqliteDriver: SqliteDriverService,
    private readonly postgresqlDriver: PostgreSQLDriverService,
    private readonly mysqlDriver: MySQLDriverService, // ← Новый драйвер
  ) {}

  createDriver(configService: YamlConfigService): IDataBaseDriver {
    const driver = configService.getDatabaseConfig().driver;

    switch (driver) {
      case 'sqlite':
        return this.sqliteDriver;
      case 'postgresql':
        return this.postgresqlDriver;
      case 'mysql': // ← Новый case
        return this.mysqlDriver;
      default:
        throw new Error(`Unsupported database driver: ${driver}`);
    }
  }
}
```

3. **Обновите DatabaseModule:**

```typescript
@Module({
  providers: [
    DatabaseService,
    DatabaseDriverFactory,
    SqliteDriverService,
    PostgreSQLDriverService,
    MySQLDriverService, // ← Новый драйвер
  ],
})
export class DatabaseModule {}
```

## 📚 Связанная документация

- [Database Module](./README.md) - основная документация модуля базы данных
- [Configuration](../config/README.md) - настройка конфигурации
- [TypeORM Configuration](./types/README.md) - типы конфигурации TypeORM

---

**Последнее обновление:** 2025-01-08
**Версия:** 1.0.0
**Статус:** ✅ Готов к использованию
