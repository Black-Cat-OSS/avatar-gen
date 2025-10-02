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
  save_path: "./storage/avatars"
  server:
    host: "0.0.0.0"
    port: 3000
  database:
    driver: "sqlite"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./storage/database/database.sqlite"
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
      url: "file:./storage/database/database.dev.sqlite"
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
