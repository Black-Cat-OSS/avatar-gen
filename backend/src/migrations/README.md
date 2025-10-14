# Миграции базы данных

Этот каталог содержит миграции TypeORM для обновления схемы базы данных с использованием Nest Commander.

## Структура

- `data-source.ts` - Конфигурация источника данных для миграций (динамически использует конфигурацию проекта)
- `commands/` - Команды Nest Commander для управления миграциями
  - `migration-runner.ts` - Точка входа для запуска команд
  - `migration.module.ts` - Модуль NestJS для регистрации команд
  - `migration.command.ts` - Единая команда для всех операций с миграциями
- `run-migrations.ts` - Устаревший скрипт (сохранен для совместимости)
- `*.ts` - Файлы миграций

## Команды

### Подготовка

**Важно**: Перед использованием команд миграций необходимо собрать приложение:

```bash
# Сборка приложения
npm run migration:build
# или просто
npm run build
```

### Основные команды миграций

#### Показать доступные команды
```bash
npm run migration
```

#### Применить все миграции
```bash
npm run migration run
```

#### Откатить последнюю миграцию
```bash
npm run migration revert
```

#### Просмотр статуса миграций
```bash
npm run migration status
```


### Устаревшие команды (для совместимости)

```bash
# Старый способ (не рекомендуется)
npm run migration:run:dev
npm run migration:revert:dev
```

## Конфигурация

Система миграций автоматически использует конфигурацию базы данных из файлов настроек проекта:

- `settings.yaml` - базовая конфигурация
- `settings.development.yaml` - настройки для разработки
- `settings.production.yaml` - настройки для продакшена

### Поддерживаемые драйверы

- **SQLite** (для разработки) - файл базы данных
- **PostgreSQL** (для продакшена) - подключение к серверу

### Переменные окружения

```bash
# Установка окружения (по умолчанию: development)
export NODE_ENV=development  # или production

# Путь к конфигурационному файлу
export CONFIG_PATH=./settings.yaml
```

## Создание новой миграции

1. Создайте новый файл миграции с именем в формате:
   ```
   {timestamp}-{DescriptionOfMigration}.ts
   ```

2. Реализуйте интерфейс `MigrationInterface`:
   ```typescript
   import { MigrationInterface, QueryRunner } from 'typeorm';

   export class YourMigrationName{timestamp} implements MigrationInterface {
     name = 'YourMigrationName{timestamp}';

     public async up(queryRunner: QueryRunner): Promise<void> {
       // Код для применения миграции
     }

     public async down(queryRunner: QueryRunner): Promise<void> {
       // Код для отката миграции
     }
   }
   ```

3. **Важно**: Добавьте новую миграцию в массив `migrations` в файле `data-source.ts`:
   ```typescript
   migrations: [
     AddGeneratorTypeToAvatar1739467273000,
     YourNewMigration{timestamp}, // Добавьте здесь
   ],
   ```

## Особенности новой системы

### Преимущества Nest Commander

- **Интеграция с NestJS**: Полная интеграция с системой DI и конфигурацией
- **Единый интерфейс**: Все команды миграций доступны через единую точку входа
- **Логирование**: Автоматическое логирование через NestJS Logger
- **Обработка ошибок**: Централизованная обработка ошибок
- **Расширяемость**: Легко добавлять новые команды

### Динамическая конфигурация

Система автоматически определяет тип базы данных из конфигурации и создает соответствующий DataSource:

```typescript
// Автоматически выбирается драйвер на основе settings.yaml
const driver = driverFactory.createDriver(configService);
const typeormConfig = driver.buildConfigs(configService);
```

### Безопасность

- Все команды выполняются в контексте NestJS приложения
- Используется та же конфигурация, что и основное приложение
- Автоматическая валидация конфигурации

## Существующие миграции

### AddGeneratorTypeToAvatar (1739467273000)
Добавляет поле `generatorType` в таблицу `avatars` для указания типа генератора аватара.

**Поля:**
- `generatorType`: varchar(50), nullable, default: 'pixelize'

**Применение:**
```bash
npm run migration:run
```

**Откат:**
```bash
npm run migration:revert
```

## Примеры использования

### Разработка

```bash
# Установка окружения разработки
export NODE_ENV=development

# Сборка приложения
npm run build

# Проверка статуса миграций
npm run migration status

# Применение миграций
npm run migration run

# Откат последней миграции
npm run migration revert
```

### Продакшен

```bash
# Установка продакшен окружения
export NODE_ENV=production

# Сборка приложения
npm run migration:build

# Применение миграций в продакшене
npm run migration run

# Проверка статуса в продакшене
npm run migration status
```

### Docker

```bash
# Запуск миграций в Docker контейнере
docker exec -it avatar-gen-backend npm run migration:docker run

# Или с подкомандами
docker exec -it avatar-gen-backend npm run migration:docker status
docker exec -it avatar-gen-backend npm run migration:docker revert
```

**Важно**: В Docker контейнере используется команда `migration:docker`, так как структура папок отличается от локальной разработки.

### Различия в структуре папок

**Локальная разработка:**
```
dist/src/migrations/commands/migration-runner.js
```

**Docker контейнер:**
```
dist/migrations/commands/migration-runner.js
```

Это происходит из-за различий в настройках сборки между локальной средой и Docker контейнером.

## Troubleshooting

### Проблема: "DriverPackageNotInstalledError: SQLite package has not been found"

**Решение:**
```bash
# Установка sqlite3 пакета
pnpm add sqlite3

# Или для всего workspace
pnpm add sqlite3 -w
```

### Проблема: "Cannot find module 'src/common/schemes'"

**Решение:** Проверьте относительные пути в импортах. Используйте относительные пути вместо абсолютных:
```typescript
// Неправильно
import { networkSchema } from 'src/common/schemes';

// Правильно
import { networkSchema } from '../common/schemes';
```

### Проблема: "getaddrinfo ENOTFOUND postgres"

**Решение:** Убедитесь, что в `settings.development.yaml` указан правильный драйвер:
```yaml
database:
  driver: 'sqlite'  # Для разработки
  # или
  driver: 'postgresql'  # Для продакшена
```

### Проблема: Миграции не применяются

**Решение:**
1. Проверьте статус миграций: `npm run migration status`
2. Убедитесь, что миграция добавлена в `data-source.ts`
3. Проверьте подключение к базе данных
4. Проверьте права доступа к файлу базы данных (для SQLite)

## Логирование

Все операции миграций логируются через NestJS Logger:

```bash
# Включение подробного логирования
export LOG_LEVEL=debug

# Запуск с логированием
npm run migration run
```

Логи сохраняются в директории `backend/logs/`.
