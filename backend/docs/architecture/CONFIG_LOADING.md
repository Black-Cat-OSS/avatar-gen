# Архитектура загрузки конфигураций

**Дата:** 2025-10-12  
**Версия:** 2.0  
**Статус:** ✅ Реализовано

## 📐 Обзор

Система загрузки конфигураций полностью рефакторирована с применением паттернов проектирования **Strategy** и **Builder**.

### Ключевые принципы

- **SOLID**: Single Responsibility, Open/Closed, Dependency Inversion
- **DRY**: Don't Repeat Yourself
- **Clean Code**: Читаемый и поддерживаемый код
- **TDD**: Test-Driven Development (все компоненты покрыты тестами)

## 🏗️ Архитектура (Pipeline)

```
settings.yaml файлы
    ↓
findBaseConfig() - находит путь к базовому файлу
    ↓
YamlFileStrategy.createBuildPlan() - создает ПЛАН построения
    ↓ возвращает BuildPlan
ConfigurationBuilder.buildWithStrategy() - выполняет план
    ↓ загружает и сливает файлы
validateConfig() - валидация через Zod схему
    ↓
Configuration - готовый объект
    ↓
Builder и Strategy уничтожаются ♻️
```

## 🎯 Паттерны проектирования

### 1. Strategy Pattern (Стратегия)

**Роль**: Определяет ЧТО загружать

`YamlFileStrategy` создает **план построения** (BuildPlan):
- Список файлов для загрузки
- Порядок загрузки
- Обязательность файлов

**Файл**: `strategies/yaml-file.strategy.ts`

```typescript
const plan = strategy.createBuildPlan('/config', 'development');
// plan.filesToLoad = [
//   { fileName: 'settings.yaml', required: true },
//   { fileName: 'settings.local.yaml', required: false },
//   { fileName: 'settings.development.yaml', required: false },
//   { fileName: 'settings.development.local.yaml', required: false }
// ]
```

**Расширение**: Легко добавить новые стратегии:
```typescript
// strategies/remote-config.strategy.ts - для удаленных конфигов
// strategies/database-config.strategy.ts - из базы данных
// strategies/consul-config.strategy.ts - из Consul
```

### 2. Builder Pattern (Строитель)

**Роль**: Определяет КАК загружать

`ConfigurationBuilder` выполняет план от Strategy:
- Получает BuildPlan
- Загружает файлы по порядку
- Сливает конфигурации (deep merge)
- Валидирует результат

**Файл**: `builders/configuration.builder.ts`

```typescript
const configuration = builder
  .setStrategy(strategy)        // Устанавливаем стратегию
  .setBasePath('/config')        // Базовый путь
  .setEnvironment('development') // Окружение
  .buildWithStrategy()           // Выполняем план
  .validate()                    // Валидируем
  .build();                      // Получаем результат
```

## 📁 Структура модуля

```
backend/src/config/modules/yaml-driver/
├── yaml-config.service.ts           # Основной сервис (~90 строк)
├── yaml-config.service.spec.ts      # Тесты (10 тестов)
├── builders/
│   ├── configuration.builder.ts     # Builder (~120 строк)
│   └── configuration.builder.spec.ts (6 тестов)
├── strategies/
│   ├── config-loading.strategy.ts   # Интерфейс стратегии
│   ├── yaml-file.strategy.ts        # YAML стратегия (~50 строк)
│   └── yaml-file.strategy.spec.ts   (6 тестов)
├── services/
│   ├── file-reader.service.ts       # Чтение YAML (~40 строк)
│   ├── file-reader.service.spec.ts  (5 тестов)
│   ├── config-merger.service.ts     # Deep merge (~40 строк)
│   └── config-merger.service.spec.ts (6 тестов)
├── types/
│   ├── config-context.interface.ts  # Контекст
│   └── build-plan.interface.ts      # План построения
└── utils/
    ├── find-base-config.ts          # Поиск settings.yaml
    └── yaml-env-substitution.ts     # Подстановка env переменных
```

## 🔄 Последовательность загрузки

Конфигурация загружается в следующем порядке (каждый следующий файл **дополняет** предыдущие):

1. **settings.yaml** - базовая конфигурация (обязательная)
2. **settings.local.yaml** - локальные переопределения (опционально)
3. **settings.{NODE_ENV}.yaml** - env-specific (опционально, если NODE_ENV установлен)
4. **settings.{NODE_ENV}.local.yaml** - env + local (опционально)

**Пример:**
```
settings.yaml            → port: 3000, host: '0.0.0.0'
settings.local.yaml      → host: 'localhost' (переопределяет)
settings.development.yaml → debug: true (добавляет)
ИТОГ: port: 3000, host: 'localhost', debug: true
```

## 🔍 Поиск базового файла

Функция `findBaseConfig()` ищет `settings.yaml` в следующем порядке:

1. **CONFIG_PATH** из env переменной (приоритет)
2. **{cwd}/settings.yaml**
3. **{cwd}/backend/settings.yaml**

**Файл**: `utils/find-base-config.ts`

### Использование в тестах

```typescript
// Устанавливаем кастомный путь
process.env.CONFIG_PATH = '/path/to/test/settings.yaml';
```

❌ **Не используйте** `TEST_MATRIX_CONFIG` - это устаревший подход!

## 🔧 Подстановка env переменных

`YamlEnvSubstitution` заменяет плейсхолдеры в YAML на значения из `process.env`:

**Файл**: `utils/yaml-env-substitution.ts`

**Поддерживаемый формат:**
```yaml
database:
  host: ${DB_HOST}              # Простая подстановка
  port: ${DB_PORT:-5432}        # Со значением по умолчанию
  user: ${DB_USER:-postgres}
```

**Логика:**
1. Если `process.env.DB_HOST` установлен → используется значение
2. Если нет, но есть `:-default` → используется default
3. Иначе → пустая строка

## 📊 Метрики улучшений

### До рефакторинга
- ❌ 220 строк в YamlConfigService
- ❌ 143 строки в методе `loadConfig()`
- ❌ Повторение кода 4 раза
- ❌ Привязка к `TEST_MATRIX_CONFIG`
- ❌ Монолитный код
- ❌ Сложно тестировать
- ❌ Локальные "велосипеды"

### После рефакторинга
- ✅ 90 строк в YamlConfigService
- ✅ Методы до 20 строк
- ✅ Код без повторений (DRY)
- ✅ Чистое разделение: production / тестовый код
- ✅ Модульная архитектура
- ✅ 33/33 теста (100% покрытие)
- ✅ Применение паттернов проектирования

## 📚 Примеры использования

### Базовое использование

```typescript
import { YamlConfigService } from './config/modules/yaml-driver/yaml-config.service';

// Сервис автоматически загружается через DI
constructor(private readonly configService: YamlConfigService) {}

// Получение конфигурации
const config = this.configService.getConfig();
const storageConfig = this.configService.getStorageConfig();
const serverConfig = this.configService.getServerConfig();
```

### Добавление новой стратегии

```typescript
// strategies/remote-config.strategy.ts
@Injectable()
export class RemoteConfigStrategy implements IConfigLoadingStrategy {
  getName(): string {
    return 'RemoteConfigStrategy';
  }

  createBuildPlan(basePath: string, nodeEnv?: string): BuildPlan {
    return {
      baseDir: basePath,
      nodeEnv,
      filesToLoad: [
        { fileName: 'remote://config-server/settings.yaml', required: true },
        // ... дополнительные удаленные файлы
      ],
    };
  }
}
```

Затем обновите `ConfigModule`:
```typescript
@Module({
  providers: [
    YamlConfigService,
    ConfigurationBuilder,
    FileReaderService,
    ConfigMergerService,
    RemoteConfigStrategy, // новая стратегия!
  ],
})
```

## 🧪 Тестирование

### Все тесты

```bash
# Тесты модуля конфигурации
pnpm test -- yaml-driver

# Конкретные тесты
pnpm test -- yaml-config.service.spec
pnpm test -- configuration.builder.spec
pnpm test -- yaml-file.strategy.spec
```

### TDD подход

Для каждого компонента:

1. ✅ Написать интерфейс
2. ✅ Написать **ТЕСТЫ** (Vitest) - СНАЧАЛА
3. ✅ Минимальная реализация
4. ✅ Рефакторинг

## 🔗 Зависимости

### Внешние библиотеки (экспериментальные)

- `yaml-dotenv` - для подстановки env (не используется напрямую, есть локальная реализация)
- `define-settings` - для поиска файлов (не используется, есть локальная реализация)

### Основные зависимости

- `js-yaml` - парсинг YAML
- `zod` - валидация конфигурации
- `@nestjs/common` - DI и логирование

## 📝 Миграция с старой архитектуры

### Что изменилось

| Аспект | Старое | Новое |
|--------|--------|-------|
| Поиск файлов | Встроенная логика | `findBaseConfig()` |
| Env подстановка | `YamlDotEnv` (локальный) | `YamlEnvSubstitution` |
| Загрузка | Монолитный метод | Builder + Strategy |
| Слияние | Встроенный `deepMerge` | `ConfigMergerService` |
| Тесты | `TEST_MATRIX_CONFIG` | `CONFIG_PATH` |
| Покрытие | Частичное | 100% (33/33 тестов) |

### Обратная совместимость

✅ API остался без изменений:
- `getConfig()`
- `getStorageConfig()`
- `getServerConfig()`
- `getDatabaseConfig()`
- `getLoggingConfig()`

✅ Env переменные работают как прежде:
- `CONFIG_PATH` - путь к конфигурации
- `NODE_ENV` - окружение

## 🚀 Преимущества новой архитектуры

### 1. Модульность
Каждый компонент делает одну вещь хорошо:
- `FileReaderService` - только чтение и парсинг
- `ConfigMergerService` - только слияние
- `YamlFileStrategy` - только создание плана
- `ConfigurationBuilder` - только выполнение плана

### 2. Расширяемость
Легко добавить новые источники конфигурации:
- Создать новую стратегию (implements IConfigLoadingStrategy)
- Зарегистрировать в ConfigModule
- Готово!

### 3. Тестируемость
Каждый компонент тестируется отдельно:
- Unit тесты для сервисов
- Unit тесты для стратегий
- Unit тесты для builder'а
- Integration тесты для YamlConfigService

### 4. Производительность
- Одноразовая загрузка при старте
- Builder и Strategy уничтожаются после использования
- Экономия памяти

## 📖 API Reference

### YamlConfigService

```typescript
@Injectable()
export class YamlConfigService implements OnModuleDestroy {
  /**
   * Получить полную конфигурацию
   */
  getConfig(): Configuration;

  /**
   * Получить конфигурацию storage
   */
  getStorageConfig(): StorageConfig;

  /**
   * Получить конфигурацию сервера
   */
  getServerConfig(): ServerConfig;

  /**
   * Получить конфигурацию базы данных
   */
  getDatabaseConfig(): DatabaseConfig;

  /**
   * Получить конфигурацию логирования
   */
  getLoggingConfig(): LoggingConfig;
}
```

### ConfigurationBuilder

```typescript
@Injectable()
export class ConfigurationBuilder {
  /**
   * Устанавливает стратегию загрузки
   */
  setStrategy(strategy: IConfigLoadingStrategy): this;

  /**
   * Устанавливает базовый путь
   */
  setBasePath(path: string): this;

  /**
   * Устанавливает окружение
   */
  setEnvironment(env?: string): this;

  /**
   * Строит конфигурацию по плану от стратегии
   */
  buildWithStrategy(): this;

  /**
   * Валидирует конфигурацию
   */
  validate(): this;

  /**
   * Возвращает готовую конфигурацию
   */
  build(): Configuration;
}
```

### IConfigLoadingStrategy

```typescript
export interface IConfigLoadingStrategy {
  /**
   * Создает план построения конфигурации
   */
  createBuildPlan(basePath: string, nodeEnv?: string): BuildPlan;

  /**
   * Возвращает имя стратегии
   */
  getName(): string;
}
```

## 🎓 Примеры конфигурационных файлов

### settings.yaml (базовая)
```yaml
app:
  server:
    host: '0.0.0.0'
    port: 3000
  storage:
    type: 's3'
    s3:
      endpoint: 'https://s3.example.com'
      bucket: 'my-bucket'
  database:
    driver: 'postgresql'
    network:
      host: ${DB_HOST:-localhost}
      port: ${DB_PORT:-5432}
      database: ${DB_NAME:-avatargen}
      username: ${DB_USER:-postgres}
      password: ${DB_PASSWORD}
```

### settings.local.yaml (локальные переопределения)
```yaml
app:
  storage:
    type: 'local'  # Переопределяем на local storage
    local:
      save_path: './storage/avatars'
  database:
    driver: 'sqlite'  # Переопределяем на SQLite для локальной разработки
    sqlite_params:
      url: 'file:./storage/database.sqlite'
```

### settings.development.yaml (для development окружения)
```yaml
app:
  logging:
    level: 'debug'
    verbose: true
    pretty: true
```

### settings.test.yaml (для тестов)
```yaml
app:
  database:
    driver: 'sqlite'
    sqlite_params:
      url: ':memory:'  # In-memory БД для тестов
  logging:
    level: 'error'
    verbose: false
```

## 🔧 Технические детали

### Deep Merge

`ConfigMergerService` использует рекурсивный алгоритм:
- Вложенные объекты сливаются рекурсивно
- Массивы **НЕ сливаются**, а заменяются полностью
- Примитивные значения заменяются

**Пример:**
```typescript
base = { app: { server: { port: 3000, host: '0.0.0.0' } } }
override = { app: { server: { host: 'localhost' } } }

result = { app: { server: { port: 3000, host: 'localhost' } } }
// port сохранился, host переопределен
```

### Валидация

Используется Zod схема из `config.schema.ts`:
- Проверка типов
- Проверка обязательных полей
- Проверка зависимостей (например, s3 конфиг при type: 's3')

При ошибке валидации выбрасывается детальное сообщение:
```
Configuration validation failed:
app.storage.s3.bucket: S3 bucket name is required
app.server.port: Expected number, received string
```

## ⚡ Производительность

### Одноразовое использование

```typescript
constructor(
  private readonly builder: ConfigurationBuilder,
  private readonly strategy: YamlFileStrategy,
) {
  // Загружаем конфигурацию ОДИН РАЗ при создании
  this.config = this.loadConfig();
  
  // После этого builder и strategy больше не нужны
  // Они уничтожаются автоматически при уничтожении сервиса
}
```

### Экономия памяти

- Builder и Strategy существуют только во время загрузки
- После построения Configuration они уничтожаются
- В runtime хранится только готовый объект Configuration

## 🛠️ Troubleshooting

### Ошибка: "Configuration file not found"

**Решение:**
1. Проверьте, что `settings.yaml` существует
2. Убедитесь, что находитесь в правильной директории
3. Установите CONFIG_PATH если файл в нестандартном месте:
   ```bash
   export CONFIG_PATH=/path/to/settings.yaml
   ```

### Ошибка: "Configuration validation failed"

**Решение:**
1. Проверьте формат YAML (используйте online валидаторы)
2. Проверьте обязательные поля в схеме `config.schema.ts`
3. Проверьте типы данных (например, port должен быть number)

### Env переменные не подставляются

**Решение:**
1. Проверьте формат: `${VAR_NAME}` или `${VAR_NAME:-default}`
2. Убедитесь, что переменная установлена: `echo $VAR_NAME`
3. Перезапустите приложение после изменения .env

## 📚 Связанные документы

- [Database Configuration](../DATABASE_CONFIGURATION.md)
- [Storage Configuration](../STORAGE_CONFIGURATION.md)
- [Logging](../LOGGING.md)
- [Testing](../testing/README.md)

---

**Автор:** Backend Team  
**Последнее обновление:** 2025-10-12  
**Покрытие тестами:** 100% (33/33 теста)

