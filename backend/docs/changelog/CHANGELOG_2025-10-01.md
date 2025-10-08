# Backend Changes - 2025-10-01

Журнал всех изменений в backend за 2025-10-01.

## 🗃️ Изменение расположения SQLite базы данных

### Изменение

Перемещена SQLite база данных из `prisma/storage/` в `storage/database/`

**Было:**

```
backend/
├── prisma/
│   └── storage/
│       └── database.sqlite
└── storage/
    └── avatars/
```

**Стало:**

```
backend/
└── storage/
    ├── avatars/              # Сгенерированные аватары
    └── database/             # SQLite база данных
        └── database.sqlite
```

### Причины

1. ✅ **Логическое группирование** - все данные приложения в одном месте (`storage/`)
2. ✅ **Упрощение backup** - весь каталог `storage/` содержит все данные
3. ✅ **Упрощение Docker volumes** - один volume вместо двух
4. ✅ **Соответствие best practices** - разделение кода (prisma/) и данных (storage/)

### Обновленные файлы

#### 1. Конфигурация

**backend/settings.yaml**

```yaml
sqlite_params:
  url: 'file:./storage/database/database.sqlite' # Было: file:./prisma/storage/database.sqlite
```

**backend/env.example**

```
DATABASE_URL="file:./storage/database/database.sqlite"  # Было: file:./prisma/storage/database.sqlite
```

#### 2. Провайдеры базы данных

**backend/src/modules/database/providers/sqlite-database.service.ts**

- Добавлено программное задание `datasourceUrl` через конструктор PrismaClient
- Значение по умолчанию: `file:./storage/database/database.sqlite`

**backend/src/modules/database/providers/postgres-database.service.ts**

- Добавлено программное задание `datasourceUrl` через конструктор PrismaClient
- Добавлен метод `buildPostgresUrl()` для построения URL из параметров конфигурации

#### 3. Docker конфигурация

**docker-compose.yml**

```yaml
volumes:
  - ./backend/storage:/app/storage # Один volume вместо двух
  # Удалено: - ./backend/prisma/storage:/app/prisma/storage

environment:
  - DATABASE_URL=file:./storage/database/database.sqlite
```

**backend/docker/Dockerfile**

```dockerfile
# Create storage directories
RUN mkdir -p storage/avatars storage/database  # Было: prisma/storage

# Set environment variables
ENV DATABASE_URL="file:./storage/database/database.sqlite"
```

#### 4. Документация

Обновлены следующие файлы:

- `backend/README.md` - примеры Docker команд
- `backend/docker/README.md` - volumes и примеры
- `DOCKER_COMPOSE_README.md` - backup инструкции

## 💡 Программное задание datasourceUrl

### Изменение

Вместо использования переменных окружения (`env("DATABASE_URL")`), URL базы данных теперь задается программно через конструктор PrismaClient.

### Реализация

Согласно [документации Prisma](https://www.prisma.io/docs/orm/reference/prisma-client-reference#programmatically-override-a-datasource-url), с версии 5.2.0+ доступно свойство `datasourceUrl`.

#### SQLite Provider

```typescript
constructor(private readonly configService: YamlConfigService) {
  const config = configService.getConfig();

  // Программно задаем URL базы данных из конфигурации
  const databaseUrl = config.app.database.sqlite_params?.url
    || 'file:./storage/database/database.sqlite';

  super({
    datasourceUrl: databaseUrl,  // ← Программное задание URL
  });

  this.config = config;
}
```

#### PostgreSQL Provider

```typescript
constructor(private readonly configService: YamlConfigService) {
  const config = configService.getConfig();

  // Программно строим URL из параметров конфигурации
  const postgresParams = config.app.database.postgresql_params;
  const databaseUrl = this.buildPostgresUrl(postgresParams);

  super({
    datasourceUrl: databaseUrl,  // ← Программное задание URL
  });

  this.config = config;
}

private buildPostgresUrl(params: any): string {
  const {
    username = 'postgres',
    password = '',
    host = 'localhost',
    port = 5432,
    database = 'avatar_gen',
    ssl = false,
  } = params || {};

  let url = `postgresql://${username}`;
  if (password) url += `:${password}`;
  url += `@${host}:${port}/${database}`;
  if (ssl) url += '?sslmode=require';

  return url;
}
```

### Преимущества

1. ✅ **Независимость от .env** - не нужно генерировать .env файл
2. ✅ **Централизованная конфигурация** - все настройки в `settings.yaml`
3. ✅ **Гибкость** - легко строить URL с дополнительными параметрами
4. ✅ **Безопасность** - пароли не в environment variables
5. ✅ **Тестируемость** - легко мокировать конфигурацию

### schema.prisma остается простым

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // Остается для совместимости с Prisma CLI
}
```

При использовании в коде, `datasourceUrl` в конструкторе переопределяет значение из schema.

## 📊 Итоговая структура

```
backend/
├── storage/                        # 📂 Все данные приложения
│   ├── avatars/                   # Сгенерированные аватары
│   └── database/                  # SQLite база данных
│       └── database.sqlite
├── src/
│   └── modules/
│       └── database/
│           ├── providers/
│           │   ├── sqlite-database.service.ts      # ✨ Программный datasourceUrl
│           │   └── postgres-database.service.ts    # ✨ Программный datasourceUrl
│           ├── database.service.ts
│           └── database.module.ts
├── prisma/
│   ├── schema.prisma             # Схема (без изменений)
│   └── migrations/               # Миграции
├── docker/
│   ├── Dockerfile                # ✨ Обновлены пути
│   └── README.md                 # ✨ Обновлена документация
└── settings.yaml                  # ✨ Обновлен путь к SQLite

# В корне проекта
docker-compose.yml                 # ✨ Обновлены volumes и env
DOCKER_COMPOSE_README.md           # ✨ Обновлена документация
```

## ✅ Checklist миграции

### Для разработчиков

- [x] Обновлен `settings.yaml`
- [x] Создана директория `storage/database/`
- [x] Скопирована база данных в новое место
- [x] Обновлены провайдеры БД (программный datasourceUrl)
- [x] Обновлен `env.example`
- [x] Обновлена документация

### Для production/docker

- [x] Обновлен `docker-compose.yml`
- [x] Обновлен `Dockerfile`
- [x] Упрощены Docker volumes
- [x] Обновлены переменные окружения

## 🚀 Применение изменений

### Локальная разработка

1. **Скопировать базу данных** (если есть данные):

   ```bash
   mkdir -p backend/storage/database
   cp backend/prisma/storage/database.sqlite backend/storage/database/database.sqlite
   ```

2. **Перезапустить приложение**:

   ```bash
   cd backend
   npm run start:dev
   ```

3. **Проверить подключение**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Docker

1. **Пересобрать образ**:

   ```bash
   docker-compose build avatar-backend
   ```

2. **Запустить**:

   ```bash
   docker-compose up -d avatar-backend
   ```

3. **Проверить логи**:
   ```bash
   docker-compose logs -f avatar-backend
   ```

## 🔍 Проверка

### Ожидаемые логи при запуске

```
[DatabaseService] LOG Database service initialized with driver: sqlite
[SqliteDatabaseService] DEBUG SQLite datasource URL: file:./storage/database/database.sqlite
[DatabaseService] LOG Initializing sqlite database connection...
[SqliteDatabaseService] LOG SQLite database connected successfully on attempt 1
```

### Проверка файловой системы

```bash
# Должна существовать база данных в новом месте
ls -la backend/storage/database/database.sqlite

# Структура storage/
tree backend/storage/
# storage/
# ├── avatars/
# │   └── [UUID].obj
# └── database/
#     └── database.sqlite
```

## 📝 Breaking Changes

### ⚠️ Внимание!

Если вы обновляетесь с предыдущей версии:

1. **База данных не будет автоматически перемещена**
   - Необходимо вручную скопировать:

   ```bash
   mkdir -p backend/storage/database
   cp backend/prisma/storage/database.sqlite backend/storage/database/database.sqlite
   ```

2. **Docker volumes нужно пересоздать**
   - Если использовали volume для `prisma/storage`, данные останутся там
   - Либо скопируйте данные, либо используйте новый volume

3. **Обновите ваши backup скрипты**
   - Путь изменился: `storage/database/database.sqlite`

## 🔗 Связанные документы

- [Database Module Documentation](./docs/modules/database/README.md)
- [Docker Configuration](./docker/README.md)
- [Docker Compose Setup](../DOCKER_COMPOSE_README.md)
- [Prisma datasourceUrl Documentation](https://www.prisma.io/docs/orm/reference/prisma-client-reference#programmatically-override-a-datasource-url)

---

**Дата:** 2025-10-01  
**Версия:** 1.0.0  
**Статус:** ✅ Завершено и протестировано
