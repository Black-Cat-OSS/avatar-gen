# Fix: Динамическое переключение Prisma Schema Provider в Docker

**Дата:** 06 октября 2025  
**Ветка:** `feature/17`  
**Автор:** AI Assistant

## 🎯 Проблема

При запуске интеграционных тестов в GitHub Actions возникала ошибка:

```
Error validating datasource `db`: the URL must start with the protocol `file:`.
  -->  schema.prisma:10
   | 
 9 |   provider = "sqlite"
10 |   url      = env("DATABASE_URL")
```

### Причина

В `backend/prisma/schema.prisma` был жестко закодирован `provider = "sqlite"`, но Docker контейнер мог запускаться с PostgreSQL URL. Это приводило к конфликту:

1. `schema.prisma` указывал `provider = "sqlite"`
2. `DATABASE_URL` содержал `postgresql://...`
3. Prisma валидация падала с ошибкой несоответствия протокола

## 🔧 Решение

Реализован механизм **динамического выбора schema provider** при старте контейнера.

### Изменения

#### 1. Созданы Schema Templates

**Файлы:**
- `backend/prisma/schema.sqlite.prisma` - схема для SQLite
- `backend/prisma/schema.postgresql.prisma` - схема для PostgreSQL

Оба файла идентичны по структуре, различаются только значением `provider`.

#### 2. Обновлен `backend/start.sh`

Добавлена логика определения провайдера и выбора schema:

```bash
# Определяем DATABASE_PROVIDER из переменной окружения или DATABASE_URL
if [ -z "$DATABASE_PROVIDER" ]; then
  case "$DATABASE_URL" in
    postgresql://*|postgres://*)
      DATABASE_PROVIDER="postgresql"
      ;;
    file:*)
      DATABASE_PROVIDER="sqlite"
      ;;
  esac
fi

# Выбираем правильный schema
if [ "$DATABASE_PROVIDER" = "postgresql" ]; then
  cp /app/prisma/schema.postgresql.prisma /app/prisma/schema.prisma
elif [ "$DATABASE_PROVIDER" = "sqlite" ]; then
  cp /app/prisma/schema.sqlite.prisma /app/prisma/schema.prisma
fi

# Генерируем Prisma Client с правильным provider
npx prisma generate

# Синхронизируем схему БД (работает для обоих провайдеров)
npx prisma db push --accept-data-loss --skip-generate
```

#### 3. Обновлен `backend/docker/Dockerfile`

**Изменения при сборке:**
- Копируются оба schema template в образ
- При сборке используется SQLite schema (для базовой компиляции)
- Установлен Prisma CLI глобально для runtime генерации

**Изменения в production stage:**
```dockerfile
# Install prisma CLI for runtime schema switching
RUN npm install -g prisma@6.16.3

# Copy schema templates
COPY --from=builder /app/prisma/*.prisma ./prisma/
```

#### 4. Обновлена документация

Добавлен раздел **"Database Provider Switching"** в `backend/docker/README.md`:
- Описание механизма автоматического определения провайдера
- Примеры использования
- Логи при старте
- Важные замечания

## ✅ Результат

### Преимущества решения

1. **Автоматическое определение** - провайдер определяется из `DATABASE_URL`
2. **Явное управление** - можно задать `DATABASE_PROVIDER` явно
3. **Нулевая конфигурация** - работает "из коробки" для обоих БД
4. **Безопасность** - schema генерируется в runtime, невозможен конфликт
5. **Гибкость** - использование `db push` вместо migrations

### Поддерживаемые сценарии

```bash
# ✅ SQLite (локальная разработка, CI)
DATABASE_URL=file:./storage/database/database.sqlite

# ✅ PostgreSQL в контейнере (разработка)
DATABASE_URL=postgresql://postgres:password@postgres:5432/avatar_gen

# ✅ Внешняя PostgreSQL (продакшен)
DATABASE_URL=postgresql://user:pass@prod-db.com:5432/avatar_gen

# ✅ Явное указание провайдера
DATABASE_PROVIDER=postgresql
DATABASE_URL=...
```

### Логи при успешном запуске

```
=== Avatar Generator Backend Startup ===
📦 Database Provider: postgresql
🔗 Database URL: postgresql://postgres:passwor...
📄 Using PostgreSQL schema...
🔧 Generating Prisma Client for postgresql...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.16.3) to ./node_modules/@prisma/client

🗄️  Synchronizing database schema...
The database is already in sync with the Prisma schema.

🚀 Starting avatar generator application...
```

## 🧪 Тестирование

### Интеграционные тесты

После внесения изменений интеграционные тесты в GitHub Actions должны:

1. ✅ Успешно запускать backend с SQLite (по умолчанию)
2. ✅ Успешно запускать backend с PostgreSQL (при указании)
3. ✅ Автоматически определять провайдер из DATABASE_URL
4. ✅ Генерировать правильный Prisma Client
5. ✅ Синхронизировать схему БД

### Локальная проверка

```bash
# Тест 1: SQLite
docker build -t avatar-backend:test ./backend
docker run -e DATABASE_URL=file:./storage/database/test.sqlite avatar-backend:test

# Тест 2: PostgreSQL
docker run \
  -e DATABASE_URL=postgresql://postgres:password@host:5432/db \
  avatar-backend:test
```

## 📋 Файлы изменены

1. ✅ `backend/prisma/schema.sqlite.prisma` - создан
2. ✅ `backend/prisma/schema.postgresql.prisma` - создан
3. ✅ `backend/start.sh` - обновлен (динамический выбор schema + очистка кэша)
4. ✅ `backend/docker/Dockerfile` - обновлен (копирование templates, Prisma CLI)
5. ✅ `backend/docker/README.md` - обновлен (новая документация)
6. ✅ `reports/FIX_ISSUE_PRISMA_SCHEMA_PROVIDER_DOCKER.md` - создан

## 🔧 Дополнительное исправление (Commit 2)

### Проблема с кэшем Prisma Client

После первого исправления обнаружилась проблема: старый Prisma Client
оставался закэшированным в `node_modules/.prisma` и
`node_modules/@prisma/client`, что приводило к использованию
неправильного provider.

### Решение

Добавлена **очистка кэша** перед генерацией нового Prisma Client:

```bash
# Удаляем старый Prisma Client (критично для переключения provider)
echo "🧹 Cleaning old Prisma Client..."
rm -rf /app/node_modules/.prisma
rm -rf /app/node_modules/@prisma/client
```

### Коммиты

- `5ddfc9a` - fix(build): Dynamic Prisma schema provider switching
- `10c9bdc` - fix(build): Clean Prisma Client cache before regeneration

## 🔄 Следующие шаги

1. ✅ Протестировать изменения локально
2. Push изменений в `origin/feature/17`
3. Протестировать в GitHub Actions
4. Убедиться что интеграционные тесты проходят успешно
5. Смержить ветку `feature/17` в `develop`

## 📚 Связанные документы

- [Backend Docker Configuration](../backend/docker/README.md)
- [Database Configuration](../backend/docs/DATABASE_CONFIGURATION.md)
- [Docker Compose Guide](../docker/README.md)

## 🏷️ Теги

`#fix` `#docker` `#prisma` `#database` `#postgresql` `#sqlite` `#ci-cd` `#integration-tests`

