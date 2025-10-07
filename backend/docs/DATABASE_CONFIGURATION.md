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

### Прямое использование YAML (без .env)

Backend **не использует .env файлы**. Вся конфигурация хранится только в YAML файлах:

1. Приложение читает `settings.yaml` напрямую через `YamlConfigService`
2. Для Prisma команд используется утилита `prisma-runner.js`, которая:
   - Читает YAML конфигурацию
   - Вычисляет `DATABASE_URL`
   - Устанавливает его в `process.env` перед запуском Prisma

### Использование Prisma команд

Все Prisma команды автоматически читают DATABASE_URL из YAML:

```bash
# Генерация Prisma client (читает settings.yaml)
npm run prisma:generate

# Миграции (читает settings.yaml или settings.{NODE_ENV}.yaml)
npm run prisma:migrate

# Production деплой (с NODE_ENV=production)
NODE_ENV=production npm run prisma:deploy

# Prisma Studio
npm run prisma:studio
```

### Windows (PowerShell)

```powershell
# Development
npm run prisma:generate

# Production
$env:NODE_ENV="production"; npm run prisma:deploy
```

---

## 📊 Как это работает

### Приложение

```
settings.yaml → YamlConfigService → DatabaseService → PrismaClient
```

### Prisma CLI

```
settings.yaml → prisma-runner.js → process.env.DATABASE_URL → Prisma CLI
```

Нет промежуточных .env файлов - все читается напрямую из YAML!

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

# 2. Запустите миграции с production окружением
NODE_ENV=production npm run prisma:deploy

# 3. Запустите приложение
npm run prisma:migrate

# 4. Запустите приложение
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

# 3. Для Prisma команд также используйте NODE_ENV
NODE_ENV=production npm run prisma:migrate
```

### Проблема: Prisma schema использует неправильный provider

**Примечание:** Начиная с версии без .env, `prisma/schema.prisma` статичен с `provider = "sqlite"`.
PostgreSQL поддерживается через runtime конфигурацию в приложении.

**Решение:** Prisma schema не нужно менять. Приложение автоматически использует правильный провайдер на основе YAML конфигурации.

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
- `backend/scripts/prisma-runner.js` - Утилита для Prisma команд с DATABASE_URL из YAML
- `backend/src/config/yaml-config.service.ts` - Сервис загрузки конфигурации
- `backend/prisma/schema.prisma` - Prisma схема (статичная, provider="sqlite")

---

**Обновлено:** 2025-10-03  
**Issue:** [#2 - не работает postgresql (конфигурации)](https://github.com/Black-Cat-OSS/avatar-gen/issues/2)
