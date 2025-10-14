# Конфигурация базы данных

**Версия:** 0.0.2  
**Дата обновления:** 2025-10-03  
**Статус:** ✅ Production Ready

Полное руководство по настройке базы данных (SQLite и PostgreSQL) с использованием системы конфигурации на основе окружений.

---

## 🎯 Обзор

Avatar Generator поддерживает две базы данных:

- **SQLite** - для разработки и тестирования
- **PostgreSQL** - для production окружения

Выбор базы данных осуществляется через **переменную окружения `NODE_ENV`** и конфигурационные файлы `settings.{NODE_ENV}.yaml`.

---

## 📁 Структура конфигурационных файлов

```
backend/
├── settings.yaml                # Базовая конфигурация (SQLite по умолчанию)
├── settings.development.yaml    # Конфигурация для разработки (SQLite)
├── settings.production.yaml     # Конфигурация для production (PostgreSQL)
└── settings.test.yaml           # Конфигурация для тестов (SQLite in-memory)
```

### Принцип работы

1. **Базовая конфигурация** (`settings.yaml`) загружается всегда
2. **Environment-specific конфигурация** (`settings.{NODE_ENV}.yaml`) загружается на основе `NODE_ENV`
3. Конфигурации **мержатся** (environment-specific переопределяет базовую)
4. TypeORM автоматически настраивается через `DatabaseModule` и драйверы

---

## 🔧 Конфигурация SQLite

### Базовая конфигурация (settings.yaml)

```yaml
app:
  database:
    driver: 'sqlite'
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
```

### Конфигурация для разработки (settings.development.yaml)

```yaml
app:
  database:
    sqlite_params:
      url: 'file:./backend/storage/database/database.dev.sqlite'
```

### Конфигурация для тестов (settings.test.yaml)

```yaml
app:
  database:
    driver: 'sqlite'
    sqlite_params:
      url: 'file::memory:' # In-memory БД для тестов
```

---

## 🐘 Конфигурация PostgreSQL

### Конфигурация для production (settings.production.yaml)

```yaml
app:
  database:
    driver: 'postgresql' # Переопределяем driver
    network:
      host: 'postgres' # имя сервиса в docker-compose
      port: 5432
      database: 'avatar_gen'
      username: 'postgres'
      password: 'password'
      ssl: false
```

### Создание собственной PostgreSQL конфигурации

Если вам нужна PostgreSQL для разработки, создайте файл `settings.development.yaml`:

```yaml
app:
  database:
    driver: 'postgresql' # Переопределяем driver на PostgreSQL
    postgresql_params:
      host: 'localhost'
      port: 5432
      database: 'avatar_gen_dev'
      username: 'postgres'
      password: 'your_password'
      ssl: false
```

---

## 🚀 Работа с конфигурацией

### TypeORM автоматическая настройка

Backend использует **TypeORM** для работы с базой данных. Вся конфигурация читается из YAML файлов:

1. Приложение читает `settings.yaml` через `YamlConfigService`
2. `DatabaseModule` автоматически настраивает TypeORM через драйверы
3. `DatabaseDriverFactory` выбирает нужный драйвер (SQLite/PostgreSQL)
4. TypeORM создает подключение на основе конфигурации

### Использование TypeORM команд

```bash
# Генерация миграций
npm run typeorm:generate -- -n MigrationName

# Запуск миграций
npm run typeorm:run

# Откат миграций
npm run typeorm:revert

# Создание новой миграции
npm run typeorm:create -- -n MigrationName
```

### Windows (PowerShell)

```powershell
# Development - создание миграции
npm run typeorm:generate -- -n AddNewFeature

# Production - запуск миграций
$env:NODE_ENV="production"; npm run typeorm:run
```

---

## 📊 Как это работает

### Приложение

```
settings.yaml → YamlConfigService → DatabaseModule → TypeORM
```

### TypeORM CLI

```
settings.yaml → YamlConfigService → DatabaseDriverFactory → TypeORM CLI
```

TypeORM автоматически настраивается через NestJS модули!

---

## 🔄 Полный рабочий процесс

### Переключение с SQLite на PostgreSQL

1. **Установите NODE_ENV**:

   ```bash
   export NODE_ENV=production  # Linux/Mac
   # или
   $env:NODE_ENV="production"  # Windows PowerShell
   ```

2. **Запустите миграции**:

   ```bash
   npm run typeorm:run
   ```

4. **Запустите приложение**:
   ```bash
   npm run start:dev
   ```

### Переключение с PostgreSQL на SQLite

1. **Установите NODE_ENV**:

   ```bash
   export NODE_ENV=development  # или не устанавливайте
   ```

2. **Запустите миграции**:
   ```bash
   npm run typeorm:run
   ```

---

## 🐳 Docker Compose

### SQLite (по умолчанию)

```bash
docker-compose up avatar-backend --no-deps
```

### PostgreSQL

```bash
# Запуск с профилем postgresql
docker-compose --profile postgresql up -d

# Или явный запуск postgres + backend
docker-compose up postgres avatar-backend
```

---

## 🧪 Тестирование

### Тесты используют SQLite in-memory

```bash
# NODE_ENV=test устанавливается автоматически Jest
npm test
```

### Ручное тестирование с PostgreSQL

```bash
# 1. Запустите PostgreSQL
docker-compose up postgres -d

# 2. Запустите миграции с production окружением
NODE_ENV=production npm run typeorm:run

# 3. Запустите приложение
npm run start:dev
```

---

## ⚠️ Troubleshooting

### Проблема: Backend подключается к SQLite вместо PostgreSQL

**Причина:** Не установлена переменная `NODE_ENV=production`

**Решение:**

```bash
# 1. Проверьте, что settings.production.yaml существует
cat backend/settings.production.yaml

# 2. Запустите с правильным окружением
NODE_ENV=production npm run start

# 3. Для TypeORM команд также используйте NODE_ENV
NODE_ENV=production npm run typeorm:run
```

### Проблема: TypeORM использует неправильный драйвер

**Примечание:** TypeORM автоматически выбирает драйвер на основе YAML конфигурации через `DatabaseDriverFactory`.

**Решение:** Проверьте настройки в `settings.yaml` и убедитесь, что `driver` установлен правильно (`sqlite` или `postgresql`).

### Проблема: PostgreSQL не запускается в Docker

**Причина:** Не запущен контейнер postgres

**Решение:**

```bash
# Проверьте статус
docker-compose ps

# Запустите PostgreSQL
docker-compose up postgres -d

# Проверьте логи
docker-compose logs postgres
```

---

## 📖 Дополнительная документация

- [Database Module README](./modules/database/README.md) - Основная документация модуля
- [Database Architecture](./modules/database/ARCHITECTURE.md) - Архитектура модуля
- [Migration Guide](./modules/database/MIGRATION_GUIDE.md) - Руководство по миграции

---

## 🔗 Связанные файлы

- `backend/settings.yaml` - Базовая конфигурация
- `backend/settings.production.yaml` - Production конфигурация с PostgreSQL
- `backend/src/config/modules/yaml-driver/yaml-config.service.ts` - Сервис загрузки конфигурации
- `backend/src/modules/database/database.module.ts` - TypeORM модуль
- `backend/src/modules/database/utils/driver-factory.ts` - Фабрика драйверов

---

**Обновлено:** 2025-10-03  
**Issue:** [#2 - не работает postgresql (конфигурации)](https://github.com/Black-Cat-OSS/avatar-gen/issues/2)
