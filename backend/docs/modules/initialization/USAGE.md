# Initialization Module - Использование

Краткое руководство по использованию модуля инициализации.

## 🚀 Автоматическое использование

Модуль инициализации автоматически активируется при запуске приложения благодаря декоратору `@Global()` и реализации `OnModuleInit`.

### В AppModule

```typescript
// src/modules/app/app.module.ts
@Module({
  imports: [
    ConfigModule,
    InitializationModule, // ← Автоматически инициализирует директории на основе настроек
    DatabaseModule,
    LoggerModule,
    AvatarModule,
  ],
})
export class AppModule {}
```

### Что происходит при запуске

1. **NestJS запускает приложение**
2. **InitializationModule активируется**
3. **DirectoryInitializerService читает настройки из `settings.yaml`**
4. **Извлекает директории из конфигурации:**
   - `app.save_path` → директория для аватаров
   - `app.database.sqlite_params.url` → директория для БД (только для SQLite)
   - Добавляет стандартные директории (`logs/`)
5. **Создает недостающие директории**
6. **Приложение продолжает нормальную работу**

⚠️ **Важно:** Директория для базы данных создается **только для SQLite**. Для PostgreSQL создание директорий не требуется.

## 📁 Создаваемые директории

Модуль создает директории на основе настроек из `settings.yaml`:

### Извлечение из конфигурации

```yaml
# settings.yaml (SQLite)
app:
  save_path: './storage/avatars' # → создаст ./storage/avatars/
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file:./storage/database/database.sqlite' # → создаст ./storage/database/
```

```yaml
# settings.yaml (PostgreSQL)
app:
  save_path: './storage/avatars' # → создаст ./storage/avatars/
  database:
    driver: 'postgresql'
    network:
      # Директории БД не создаются для PostgreSQL
      host: 'localhost'
      port: 5432
      database: 'avatar_gen'
```

### Созданная структура

```
storage/                    # Основная директория данных
├── avatars/               # Сгенерированные аватары (из app.save_path)
└── database/              # SQLite база данных (из sqlite_params.url)
    └── database.sqlite

logs/                      # Логи приложения (стандартная директория)
```

### Динамическое определение

Модуль анализирует `settings.yaml` и извлекает пути из следующих настроек:

- **`app.save_path`** - директория для аватаров
- **`app.database.sqlite_params.url`** - путь к SQLite базе данных
- **Стандартные директории** - `logs/`

## 🔍 Проверка статуса

### Через сервис

```typescript
import { InitializationService } from './modules/initialization';

@Injectable()
export class MyService {
  constructor(private readonly initializationService: InitializationService) {}

  async checkInitializationStatus() {
    const statuses = this.initializationService.getAllInitializerStatus();
    console.log('Initialization status:', statuses);
  }
}
```

### Через API (если добавите endpoint)

```typescript
@Get('initialization-status')
async getInitializationStatus() {
  return this.initializationService.getAllInitializerStatus();
}
```

## 🛠️ Расширение

### Добавление нового инициализатора

1. **Создайте сервис реализующий IInitializer**

```typescript
@Injectable()
export class CustomInitializerService implements IInitializer {
  getInitializerId(): string {
    return 'custom-initializer';
  }

  getPriority(): number {
    return 100; // Приоритет (меньше = раньше)
  }

  async initialize(): Promise<void> {
    // Ваша логика инициализации
    this.logger.log('Custom initialization completed');
  }
}
```

2. **Добавьте в модуль**

```typescript
// src/modules/initialization/initialization.module.ts
@Module({
  providers: [
    InitializationService,
    DirectoryInitializerService,
    CustomInitializerService, // ← Ваш инициализатор
  ],
  exports: [InitializationService, DirectoryInitializerService, CustomInitializerService],
})
export class InitializationModule {}
```

## 📊 Мониторинг

### Логи инициализации

```
[InitializationService] LOG Starting application initialization...
[InitializationService] LOG Discovered 2 initializers
[InitializationService] LOG Executing 2 initializers...
[InitializationService] LOG Initializing: directory-initializer (priority: 10)
[DirectoryInitializerService] LOG Initializing application directories...
[DirectoryInitializerService] LOG ✓ Created directory: storage/avatars
[DirectoryInitializerService] LOG ✓ Created directory: storage/database
[InitializationService] LOG ✓ directory-initializer completed in 45ms
[InitializationService] LOG Application initialization completed successfully
```

### Статусы инициализаторов

```typescript
interface InitializationStatus {
  id: string; // 'directory-initializer'
  priority: number; // 10
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // в миллисекундах
  error?: string;
  metadata?: Record<string, any>;
}
```

## 🔧 Конфигурация

Модуль инициализации не требует дополнительной конфигурации. Все необходимые директории жестко заданы в коде:

```typescript
// В DirectoryInitializerService
private addAdditionalDirectories(directories: Set<string>): void {
  directories.add('storage');
  directories.add('logs');
  directories.add('storage/avatars');
  directories.add('storage/database');
}
```

Если нужно изменить структуру директорий:

1. Обновите `requiredDirectories` в `DirectoryInitializerService`
2. Обновите соответствующие настройки в `settings.yaml`
3. Обновите Docker конфигурацию

## 🧪 Тестирование

### Проверка создания директорий

```bash
# Запустите приложение
cd backend
npm run start:dev

# Проверьте созданные директории
ls -la storage/
# storage/
# ├── avatars/      # Создана на основе app.save_path из settings.yaml
# └── database/     # Создана на основе sqlite_params.url из settings.yaml

ls -la logs/
# logs/             # Стандартная директория для логов
```

### Проверка через API

Если добавите health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Должно вернуться что-то вроде:

```json
{
  "status": "ok",
  "info": {
    "database": "sqlite",
    "uptime": "10s"
  },
  "details": {
    "directories": {
      "storage": "ok",
      "typeorm": "ok",
      "logs": "ok"
    }
  }
}
```

## 🚨 Troubleshooting

### Директории не создаются

**Проверьте:**

1. Модуль добавлен в AppModule
2. Права доступа к файловой системе
3. Логи приложения на наличие ошибок

### Ошибки инициализации

**Проверьте логи:**

```bash
# В Docker
docker-compose logs avatar-backend

# Локально
cd backend && npm run start:dev
```

### Проблемы с правами доступа

**На Linux/Mac:**

```bash
# Дайте права текущему пользователю
sudo chown -R $USER:$USER storage/ logs/
```

**На Windows:**

- Убедитесь, что у вас есть права на создание файлов в директории проекта

## 📚 Связанная документация

- [Основная документация модуля](./README.md)
- [Архитектура модуля](./README.md#архитектура)
- [Расширение модуля](./README.md#расширение-модуля)

---

**Последнее обновление:** 2025-10-01
**Статус:** ✅ Готов к использованию
