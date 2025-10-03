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
4. Скрипт `generate-env.js` генерирует `.env` файл и обновляет `prisma/schema.prisma`

---

## 🔧 Конфигурация SQLite

### Базовая конфигурация (settings.yaml)

```yaml
app:
  database:
    driver: "sqlite"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./storage/database/database.sqlite"
```

### Конфигурация для разработки (settings.development.yaml)

```yaml
app:
  database:
    sqlite_params:
      url: "file:./backend/storage/database/database.dev.sqlite"
```

### Конфигурация для тестов (settings.test.yaml)

```yaml
app:
  database:
    driver: "sqlite"
    sqlite_params:
      url: "file::memory:"  # In-memory БД для тестов
```

---

## 🐘 Конфигурация PostgreSQL

### Конфигурация для production (settings.production.yaml)

```yaml
app:
  database:
    driver: "postgresql"  # Переопределяем driver
    network:
      host: "postgres"  # имя сервиса в docker-compose
      port: 5432
      database: "avatar_gen"
      username: "postgres"
      password: "password"
      ssl: false
```

### Создание собственной PostgreSQL конфигурации

Если вам нужна PostgreSQL для разработки, создайте файл `settings.development.yaml`:

```yaml
app:
  database:
    driver: "postgresql"  # Переопределяем driver на PostgreSQL
    postgresql_params:
      host: "localhost"
      port: 5432
      database: "avatar_gen_dev"
      username: "postgres"
      password: "your_password"
      ssl: false
```

---

## 🚀 Генерация конфигурации

### Скрипт generate-env.js

Скрипт автоматически:
1. Читает `settings.yaml` (базовая конфигурация)
2. Проверяет `NODE_ENV`
3. Загружает `settings.{NODE_ENV}.yaml` если существует
4. Мержит конфигурации
5. Генерирует `.env` файл
6. Обновляет `prisma/schema.prisma` с правильным provider

### Использование

```bash
# Без NODE_ENV (используется базовая конфигурация - SQLite)
node scripts/generate-env.js

# С NODE_ENV=development (SQLite для разработки)
NODE_ENV=development node scripts/generate-env.js

# С NODE_ENV=production (PostgreSQL для production)
NODE_ENV=production node scripts/generate-env.js

# С NODE_ENV=test (SQLite in-memory для тестов)
NODE_ENV=test node scripts/generate-env.js
```

### Windows (PowerShell)

```powershell
# Development
$env:NODE_ENV="development"; node scripts/generate-env.js

# Production
$env:NODE_ENV="production"; node scripts/generate-env.js
```

---

## 📊 Примеры вывода

### SQLite (default)

```
Loading base configuration from: E:\...\backend\settings.yaml
Current NODE_ENV: not set
No valid NODE_ENV set, using base configuration only
✓ Prisma schema updated for sqlite
✓ .env file generated successfully
  Environment: default
  Database Provider: sqlite
  Database URL: file:./storage/database/database.sqlite
```

### PostgreSQL (production)

```
Loading base configuration from: E:\...\backend\settings.yaml
Current NODE_ENV: production
Looking for environment config at: E:\...\backend\settings.production.yaml
Loading environment-specific configuration from: E:\...\backend\settings.production.yaml
Environment-specific configuration merged successfully
✓ Prisma schema updated for postgresql
✓ .env file generated successfully
  Environment: production
  Database Provider: postgresql
  Database URL: postgresql://postgres:password@postgres:5432/avatar_gen
```

---

## 🔄 Полный рабочий процесс

### Переключение с SQLite на PostgreSQL

1. **Установите NODE_ENV**:
   ```bash
   export NODE_ENV=production  # Linux/Mac
   # или
   $env:NODE_ENV="production"  # Windows PowerShell
   ```

2. **Сгенерируйте конфигурацию**:
   ```bash
   cd backend
   node scripts/generate-env.js
   ```

3. **Запустите миграции**:
   ```bash
   npm run prisma:migrate
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

2. **Сгенерируйте конфигурацию**:
   ```bash
   node scripts/generate-env.js
   ```

3. **Запустите миграции**:
   ```bash
   npm run prisma:migrate
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

# 2. Сгенерируйте production конфигурацию
NODE_ENV=production node scripts/generate-env.js

# 3. Запустите миграции
npm run prisma:migrate

# 4. Запустите приложение
npm run start:dev
```

---

## ⚠️ Troubleshooting

### Проблема: Backend подключается к SQLite вместо PostgreSQL

**Причина:** Не установлена переменная `NODE_ENV=production` перед генерацией `.env`

**Решение:**
```bash
# 1. Установите NODE_ENV
export NODE_ENV=production

# 2. Перегенерируйте .env
node scripts/generate-env.js

# 3. Проверьте .env файл
cat .env

# Должно быть:
# DATABASE_URL="postgresql://postgres:password@postgres:5432/avatar_gen"
```

### Проблема: Prisma schema использует неправильный provider

**Причина:** `.env` файл не был перегенерирован после изменения конфигурации

**Решение:**
```bash
# Перегенерируйте с правильным NODE_ENV
NODE_ENV=production node scripts/generate-env.js

# Проверьте prisma/schema.prisma
cat prisma/schema.prisma | grep provider

# Должно быть:
# provider = "postgresql"
```

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
- `backend/scripts/generate-env.js` - Скрипт генерации .env
- `backend/src/config/yaml-config.service.ts` - Сервис загрузки конфигурации
- `backend/.env` - Сгенерированные переменные окружения (gitignore)
- `backend/prisma/schema.prisma` - Prisma схема (автогенерируемая)

---

**Обновлено:** 2025-10-03  
**Issue:** [#2 - не работает postgresql (конфигурации)](https://github.com/Black-Cat-OSS/avatar-gen/issues/2)

