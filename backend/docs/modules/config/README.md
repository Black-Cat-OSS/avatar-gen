# Конфигурационный модуль

Модуль отвечает за загрузку и валидацию конфигурации приложения с поддержкой окружений.

## Входные данные

### Обязательные файлы

- `settings.yaml` - основной файл конфигурации (обязателен)

### Опциональные файлы

- `settings.development.yaml` - конфигурация для разработки
- `settings.production.yaml` - конфигурация для продакшена
- `settings.test.yaml` - конфигурация для тестирования

### Переменные окружения

- `NODE_ENV` - режим окружения (`development`, `production`, `test`)
- `CONFIG_PATH` - пользовательский путь к файлу конфигурации (по умолчанию `./settings.yaml`)

## Структура конфигурации

```typescript
interface Configuration {
  app: {
    save_path: string;
    server: {
      host: string;
      port: number;
    };
    database: {
      driver: 'sqlite' | 'postgresql';
      connection: {
        maxRetries: number;
        retryDelay: number;
      };
      sqlite_params?: {
        url: string;
      };
      postgresql_params?: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        ssl: boolean;
      };
    };
  };
}
```

## Алгоритм работы

1. **Поиск основного файла**: Загружает `settings.yaml` или файл по пути из `CONFIG_PATH`
2. **Проверка существования**: Если файл не найден - завершает выполнение с ошибкой
3. **Загрузка окружения**: Если определен `NODE_ENV`, ищет соответствующий файл `settings.{NODE_ENV}.yaml`
4. **Объединение конфигураций**: Окружение-специфичная конфигурация переопределяет основную
5. **Валидация**: Проверяет финальную конфигурацию по схеме

## Возможные ошибки и способы их исправления

### Ошибка: "Base configuration file not found"

- **Причина**: Файл `settings.yaml` не найден или недоступен
- **Решение**: Создать файл `settings.yaml` в корне проекта или указать корректный путь в `CONFIG_PATH`

### Ошибка: "Configuration validation failed"

- **Причина**: Структура конфигурации не соответствует схеме валидации
- **Решение**: Проверить корректность YAML синтаксиса и соответствие требуемой структуре

### Ошибка: "Configuration loading failed"

- **Причина**: Ошибка при чтении или парсинге YAML файлов
- **Решение**: Проверить права доступа к файлам и корректность YAML синтаксиса

## Использование

Модуль автоматически инициализируется при запуске приложения и предоставляет конфигурацию через `YamlConfigService`.

```typescript
import { YamlConfigService } from './config/yaml-config.service';

// В конструкторе сервиса или контроллера
constructor(private readonly configService: YamlConfigService) {}

// Получение полной конфигурации
const config = this.configService.getConfig();

// Получение конкретных настроек
const savePath = this.configService.getSavePath();
const serverConfig = this.configService.getServerConfig();
const databaseConfig = this.configService.getDatabaseConfig();
```

## Примеры конфигураций

### settings.yaml (основная)

```yaml
app:
  save_path: './storage/avatars'
  server:
    host: '0.0.0.0'
    port: 3000
  database:
    driver: 'sqlite'
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
```

### settings.development.yaml

```yaml
app:
  server:
    port: 3001
  database:
    connection:
      maxRetries: 5
    sqlite_params:
      url: 'file:./storage/database/database.dev.sqlite'
```

### settings.production.yaml

```yaml
app:
  server:
    port: 8080
  database:
    connection:
      maxRetries: 3
      retryDelay: 3000
```

## API Reference

### YamlConfigService

#### Методы получения конфигурации

##### `getConfig(): Configuration`

Получение полной конфигурации приложения.

**Возвращает:** Объект конфигурации

##### `getSavePath(): string`

Получение пути для сохранения файлов.

**Возвращает:** Путь к директории сохранения

##### `getServerConfig(): ServerConfig`

Получение конфигурации сервера.

**Возвращает:** Конфигурация сервера (host, port)

##### `getDatabaseConfig(): DatabaseConfig`

Получение конфигурации базы данных.

**Возвращает:** Конфигурация БД (driver, connection params)

##### `getLoggingConfig(): LoggingConfig`

Получение конфигурации логирования.

**Возвращает:** Конфигурация логирования (level, verbose, pretty)

##### `getStorageConfig(): StorageConfig`

Получение конфигурации хранилища.

**Возвращает:** Конфигурация хранилища (type, s3 params, local params)

## Валидация конфигурации

Модуль использует библиотеку Zod для валидации конфигурации:

```typescript
// Схема валидации
const configSchema = z.object({
  app: z.object({
    save_path: z.string().min(1),
    server: z.object({
      host: z.string().default('0.0.0.0'),
      port: z.number().min(1).max(65535).default(3000),
    }),
    database: z.object({
      driver: z.enum(['sqlite', 'postgresql']),
      connection: z.object({
        maxRetries: z.number().min(1).max(10).default(3),
        retryDelay: z.number().min(100).max(10000).default(2000),
      }),
      sqlite_params: z
        .object({
          url: z.string().min(1),
        })
        .optional(),
      postgresql_params: z
        .object({
          url: z.string().min(1),
        })
        .optional(),
      network: z
        .object({
          host: z.string().default('localhost'),
          port: z.number().min(1).max(65535).default(5432),
          database: z.string().min(1),
          username: z.string().min(1),
          password: z.string().min(1),
          ssl: z.boolean().default(false),
        })
        .optional(),
    }),
    storage: z.object({
      type: z.enum(['local', 's3']),
      local: z
        .object({
          save_path: z.string().min(1),
        })
        .optional(),
      s3: z
        .object({
          endpoint: z.string().url(),
          bucket: z.string().min(1),
          access_key: z.string().min(1),
          secret_key: z.string().min(1),
          region: z.string().default('us-east-1'),
          force_path_style: z.boolean().default(false),
          connection: z
            .object({
              maxRetries: z.number().min(1).max(10).default(3),
              retryDelay: z.number().min(100).max(10000).default(2000),
            })
            .optional(),
        })
        .optional(),
    }),
    logging: z.object({
      level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
      verbose: z.boolean().default(false),
      pretty: z.boolean().default(false),
    }),
  }),
});
```

## Расширение конфигурации

### Добавление новых полей

1. **Обновите схему валидации в `configuration.ts`:**

```typescript
const configSchema = z.object({
  app: z.object({
    // Существующие поля...
    new_field: z.string().optional(),
  }),
});
```

2. **Обновите интерфейс Configuration:**

```typescript
interface Configuration {
  app: {
    // Существующие поля...
    new_field?: string;
  };
}
```

3. **Добавьте метод в YamlConfigService:**

```typescript
getNewField(): string | undefined {
  return this.config.app.new_field;
}
```

### Добавление нового окружения

1. **Создайте файл конфигурации:**

```yaml
# settings.staging.yaml
app:
  server:
    port: 4000
  database:
    connection:
      maxRetries: 2
```

2. **Установите переменную окружения:**

```bash
export NODE_ENV=staging
```

## Отладка конфигурации

### Включение подробного логирования

```yaml
# settings.development.yaml
app:
  logging:
    level: 'debug'
    verbose: true
    pretty: true
```

### Проверка загруженной конфигурации

```typescript
// В любом сервисе
constructor(private readonly configService: YamlConfigService) {
  console.log('Loaded config:', JSON.stringify(this.configService.getConfig(), null, 2));
}
```

### Валидация конфигурации

```typescript
// Тест валидации
import { YamlConfigService } from './config/yaml-config.service';

const configService = new YamlConfigService();
try {
  const config = configService.getConfig();
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}
```

## Производительность

- **Кэширование**: Конфигурация загружается один раз при инициализации
- **Ленивая загрузка**: Файлы окружения загружаются только при необходимости
- **Валидация**: Происходит один раз при загрузке, не при каждом обращении

## Безопасность

- **Секреты**: Чувствительные данные (пароли, ключи) не логируются
- **Валидация**: Все входящие данные проверяются по схеме
- **Типизация**: Строгая типизация предотвращает ошибки времени выполнения

---

**Последнее обновление:** 2025-10-01
**Версия:** 1.0.0
**Статус:** ✅ Готов к использованию
