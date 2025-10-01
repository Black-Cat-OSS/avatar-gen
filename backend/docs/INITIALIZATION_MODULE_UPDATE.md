# Initialization Module - Обновление архитектуры

Обновление модуля инициализации для динамического чтения настроек из `settings.yaml`.

## 🎯 Проблема

Первоначальная реализация модуля инициализации жестко задавала директории в коде:

```typescript
// ❌ Жестко заданные директории
private readonly requiredDirectories = {
  storage: ['storage', 'storage/avatars', 'storage/database'],
  prisma: ['prisma/storage'],
  logs: ['logs'],
};
```

Это не соответствовало требованию читать настройки из `settings.yaml`.

## ✅ Решение

Переработан модуль для динамического извлечения директорий из конфигурации.

### Изменения в DirectoryInitializerService

#### 1. Конструктор с зависимостью от ConfigService

```typescript
@Injectable()
export class DirectoryInitializerService implements OnModuleInit {
  private readonly config: any;

  constructor(private readonly configService: YamlConfigService) {
    this.config = this.configService.getConfig();
  }
  // ...
}
```

#### 2. Динамическое извлечение директорий

```typescript
async onModuleInit(): Promise<void> {
  // Получаем директории из настроек
  const directoriesToCreate = this.extractDirectoriesFromConfig();
  await this.ensureDirectoriesExist(directoriesToCreate);
}
```

#### 3. Методы извлечения директорий

```typescript
private extractDirectoriesFromConfig(): string[] {
  const directories = new Set<string>();

  // Извлекаем директории из различных настроек
  this.extractStorageDirectories(directories);
  this.extractDatabaseDirectories(directories);
  this.extractLogDirectories(directories);
  this.addAdditionalDirectories(directories);

  return Array.from(directories).sort();
}
```

#### 4. Извлечение из конкретных настроек

```typescript
private extractStorageDirectories(directories: Set<string>): void {
  // Директория для аватаров из app.save_path
  if (this.config.app?.save_path) {
    const avatarDir = dirname(this.config.app.save_path);
    directories.add(avatarDir);
  }
}

private extractDatabaseDirectories(directories: Set<string>): void {
  // Директория для SQLite БД из app.database.sqlite_params.url
  if (this.config.app?.database?.sqlite_params?.url) {
    const sqliteUrl = this.config.app.database.sqlite_params.url;
    if (sqliteUrl.startsWith('file:')) {
      const filePath = sqliteUrl.replace('file:', '');
      const dbDir = dirname(filePath);
      directories.add(dbDir);
    }
  }
}
```

### Обновленные настройки в settings.yaml

```yaml
app:
  save_path: "./storage/avatars"  # ← Используется для извлечения storage/avatars/
  database:
    sqlite_params:
      url: "file:./storage/database/database.sqlite"  # ← Используется для извлечения storage/database/
```

## 📊 Создаваемые директории

### На основе настроек

| Настройка | Извлекаемая директория | Пример |
|-----------|----------------------|---------|
| `app.save_path: "./storage/avatars"` | `storage/avatars` | `./storage/avatars` |
| `database.sqlite_params.url: "file:./storage/database/database.sqlite"` | `storage/database` | `./storage/database` |

### Стандартные директории

| Директория | Назначение | Причина добавления |
|-------------|------------|-------------------|
| `logs/` | Логи приложения | Стандартная директория для логов |
| `prisma/storage/` | Временные файлы Prisma | Необходима для работы Prisma CLI |
| `storage/` | Корневая директория | Родительская для аватаров и БД |

## 🚀 Преимущества нового подхода

### ✅ Динамичность
- Директории определяются настройками, а не кодом
- Легко добавлять новые директории через настройки
- Автоматическая синхронизация с Docker и другими окружениями

### ✅ Гибкость
- Поддержка произвольных путей в настройках
- Легкое расширение для новых типов ресурсов
- Независимость от жестко заданных путей

### ✅ Безопасность
- Создает только необходимые директории
- Не перезаписывает существующие файлы
- Использует `recursive: true` только для создания структуры

### ✅ Тестируемость
- Легко мокировать настройки для тестов
- Предсказуемое поведение на основе конфигурации
- Легко добавлять новые типы ресурсов

## 🔧 Расширение модуля

### Добавление нового типа ресурсов

1. **Добавьте настройки в settings.yaml:**
   ```yaml
   app:
     temp_files_path: "./storage/temp"  # Новая настройка
   ```

2. **Добавьте метод извлечения:**
   ```typescript
   private extractTempDirectories(directories: Set<string>): void {
     if (this.config.app?.temp_files_path) {
       const tempDir = dirname(this.config.app.temp_files_path);
       directories.add(tempDir);
     }
   }
   ```

3. **Вызовите метод в основном методе:**
   ```typescript
   private extractDirectoriesFromConfig(): string[] {
     this.extractStorageDirectories(directories);
     this.extractDatabaseDirectories(directories);
     this.extractTempDirectories(directories);  // ← Новый метод
     // ...
   }
   ```

## 📋 Сравнение подходов

| Аспект | Старый подход | Новый подход |
|--------|---------------|--------------|
| **Источник директорий** | Жестко в коде | Из настроек |
| **Гибкость** | ❌ Статичный | ✅ Динамичный |
| **Расширяемость** | ❌ Требует изменения кода | ✅ Через настройки |
| **Тестируемость** | ✅ Легко | ✅ Легко |
| **Документирование** | ❌ В коде | ✅ В настройках |

## ✅ Результат

Модуль инициализации теперь:

1. ✅ **Читает настройки из `settings.yaml`**
2. ✅ **Создает директории динамически**
3. ✅ **Расширяем для новых ресурсов**
4. ✅ **Синхронизирован с Docker конфигурацией**
5. ✅ **Хорошо документирован**

### Тестирование

```bash
# Запуск приложения
cd backend
npm run start:dev

# Ожидаемые логи
[DirectoryInitializerService] LOG Initializing application directories from configuration...
[DirectoryInitializerService] LOG ✓ Created directory: storage/avatars
[DirectoryInitializerService] LOG ✓ Created directory: storage/database
[DirectoryInitializerService] LOG ✓ Created directory: prisma/storage
[DirectoryInitializerService] LOG ✓ Created directory: logs
```

---

**Дата обновления:** 2025-10-01
**Статус:** ✅ Завершено
**Версия:** 1.1.0

