# Backend Documentation

**Версия:** 0.0.2  
**Дата обновления:** 2025-10-03  
**Статус:** ✅ Production Ready

Документация backend приложения Avatar Generator - NestJS API сервер для генерации аватаров.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Генерация Prisma client и миграции
npm run prisma:generate
npm run prisma:migrate

# Запуск в dev режиме
npm run start:dev
```

→ API: http://localhost:3000  
→ Swagger: http://localhost:3000/swagger

**Подробнее:** [Backend README](../README.md)

---

## 📚 Документация по разделам

### [📦 Modules](./modules/)

**Документация модулей приложения**

- [Database Module](./modules/database/) - Работа с БД (SQLite/PostgreSQL)
  - Facade Pattern, Factory Provider
  - 100% покрытие критических операций
  - Автоматический retry
- [Avatar Module](./modules/) - Генерация и управление аватарами
- [Logger Module](./modules/) - Централизованное логирование
- [Storage Module](./modules/) - Файловое хранилище
- [Health Module](./modules/) - Health checks
- [Initialization Module](../src/modules/initialization/) - Инициализация директорий

→ [Перейти к модулям](./modules/README.md)

### [🧪 Testing](./testing/)

**Тестирование backend**

- 50 unit и E2E тестов
- 100% покрытие HealthController
- 97%+ покрытие AvatarController
- 90%+ покрытие AvatarService

**Документы:**
- [Testing Guide](./testing/TESTING.md) - Полное руководство
- [Test Results](./testing/TEST_RESULTS.md) - Результаты и статистика

→ [Перейти к тестированию](./testing/README.md)

### [📝 Changelog](./changelog/)

**История изменений**

- [Changelog 2025-10-01](./changelog/CHANGELOG_2025-10-01.md)
  - Перемещение SQLite в `storage/database/`
  - Программное задание datasourceUrl
- [Initialization Module Update](./changelog/INITIALIZATION_MODULE_UPDATE.md)
  - Динамическое чтение из `settings.yaml`

→ [Перейти к истории изменений](./changelog/README.md)

### [📦 Archive](./archive/)

**Архив устаревших документов**

- INDEX.md (старый индекс)
- DOCUMENTATION_STRUCTURE.md
- REORGANIZATION_2025-10-01.md

→ [Перейти к архиву](./archive/README.md)

---

## 🏗️ Архитектура

### Технологический стек

```
NestJS 11
├── TypeScript 5.9
├── Prisma 6.16
│   ├── SQLite (dev)
│   └── PostgreSQL (prod)
├── Sharp 0.34 (image processing)
├── Pino (logging)
├── Zod (validation)
└── Swagger/OpenAPI
```

### Структура модулей

```
src/
├── config/                 # Конфигурация (YAML)
├── modules/
│   ├── app/               # Корневой модуль
│   ├── avatar/            # Генерация аватаров
│   ├── database/          # Работа с БД
│   ├── storage/           # Файловое хранилище
│   ├── health/            # Health checks
│   ├── logger/            # Логирование
│   └── initialization/    # Инициализация директорий
├── common/
│   ├── dto/               # Data Transfer Objects
│   ├── enums/             # Перечисления
│   └── interfaces/        # Интерфейсы
└── main.ts                # Точка входа
```

## 📖 API Endpoints

### Health Endpoints

| Endpoint | Method | Описание |
|----------|--------|----------|
| `/health` | GET | Базовая проверка здоровья |
| `/health/detailed` | GET | Детальная информация |

### Avatar Endpoints

| Endpoint | Method | Описание |
|----------|--------|----------|
| `/api/generate` | POST | Генерация нового аватара |
| `/api/list` | GET | Список аватаров (пагинация) |
| `/api/color-schemes` | GET | Доступные цветовые схемы |
| `/api/:id` | GET | Получение аватара по ID |
| `/api/:id` | DELETE | Удаление аватара |
| `/api/health` | GET | Проверка здоровья сервиса |

**Подробнее:** [Swagger UI](http://localhost:3000/swagger)

## 🔧 Конфигурация

### settings.yaml

```yaml
app:
  save_path: "./storage/avatars"
  server:
    host: "0.0.0.0"
    port: 3000
  database:
    driver: "sqlite"  # или "postgresql"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./storage/database/database.sqlite"
```

### Переменные окружения

```bash
NODE_ENV=production
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./storage/database/database.sqlite
CONFIG_PATH=./settings.yaml
```

## 🐳 Docker

### Сборка образа

```bash
docker build -t avatar-backend -f docker/Dockerfile .
```

### Запуск контейнера

```bash
docker run -p 3000:3000 \
  -v $(pwd)/storage:/app/storage \
  -v $(pwd)/settings.yaml:/app/settings.yaml \
  avatar-backend
```

**Подробнее:** [Docker README](../docker/README.md)

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# С coverage
npm run test:cov

# Watch режим
npm run test:watch

# Конкретный модуль
npm test avatar
```

### Статистика

```
✅ Test Suites: 4 passed, 4 total
✅ Tests:       50 passed, 50 total
⏱️  Time:        ~18s
```

**Подробнее:** [Testing Guide](./testing/TESTING.md) | [Test Results](./testing/TEST_RESULTS.md)

## 📊 Основные модули

### Database Module

**Статус:** ✅ Production Ready v3.0.1

- Поддержка SQLite и PostgreSQL
- Facade Pattern для управления
- Factory Provider (нулевой overhead)
- Автоматический retry
- Health check

**Документация:**
- [README](./modules/database/README.md)
- [Architecture](./modules/database/ARCHITECTURE.md)
- [Migration Guide](./modules/database/MIGRATION_GUIDE.md)

### Avatar Module

**Статус:** ✅ Production Ready  
**Покрытие:** 90%+

- Генерация уникальных аватаров
- Поддержка цветовых схем
- Применение фильтров (grayscale, sepia, negative)
- Множественные размеры (2^5 до 2^9)

### Logger Module

**Статус:** ✅ Production Ready

- Централизованное логирование (Pino)
- Уровни: fatal, error, warn, info, debug, trace
- Rotation логов
- Pretty print для dev

## 📦 NPM Scripts

```bash
# Development
npm run start           # Запуск приложения
npm run start:dev       # Dev режим с hot reload
npm run start:debug     # Debug режим

# Build
npm run build           # Production сборка
npm run format          # Форматирование (Prettier)
npm run lint            # Линтинг (ESLint)

# Testing
npm test                # Запуск тестов
npm run test:watch      # Watch режим
npm run test:cov        # С coverage
npm run test:debug      # Debug режим
npm run test:e2e        # E2E тесты

# Prisma
npm run env:generate    # Генерация .env из settings.yaml
npm run prisma:generate # Генерация Prisma client
npm run prisma:migrate  # Запуск миграций
npm run prisma:studio   # Prisma Studio (GUI)
npm run prisma:reset    # Сброс БД (dev only)
npm run prisma:deploy   # Deploy миграций (prod)
```

## 🔗 Связанные документы

### Backend

- [Backend README](../README.md) - Главное руководство
- [Docker Documentation](../docker/README.md) - Docker конфигурация
- [Modules](./modules/README.md) - Документация модулей
- [Testing](./testing/README.md) - Тестирование

### Root проекта

- [Main README](../../README.md) - Обзор всего проекта
- [Root Changelog](../../CHANGELOG.md) - Общая история изменений
- [Project Documentation](../../docs/README.md) - Общая документация

### Docker

- [Docker Compose](../../docker/README.md) - Docker Compose конфигурация
- [Scripts](../../docs/deployment/SCRIPTS.md) - Скрипты управления

## 💡 Best Practices

### 1. Использование DatabaseService

```typescript
constructor(private readonly db: DatabaseService) {}

async getData() {
  return await this.db.avatar.findMany();
}
```

### 2. Обработка ошибок

```typescript
async createAvatar(dto: CreateAvatarDto) {
  try {
    return await this.avatarService.generateAvatar(dto);
  } catch (error) {
    this.logger.error('Failed to create avatar', error);
    throw new InternalServerErrorException('Avatar creation failed');
  }
}
```

### 3. Логирование

```typescript
this.logger.log(`Avatar created: ${avatar.id}`);
this.logger.error('Database connection failed', error);
this.logger.warn('Low disk space');
```

### 4. Транзакции

```typescript
await this.db.$transaction(async (tx) => {
  await tx.avatar.create({ data: avatar1 });
  await tx.avatar.create({ data: avatar2 });
});
```

## 🆘 Troubleshooting

### Проблемы с подключением к БД

```bash
# Проверьте настройки
cat settings.yaml

# Проверьте health endpoint
curl http://localhost:3000/api/health

# Проверьте логи
tail -f logs/*.log
```

### Проблемы со сборкой

```bash
# Очистите dist
rm -rf dist node_modules
npm install
npm run build
```

**Подробнее:** [Troubleshooting](../../docs/development/troubleshooting.md)

## 📝 Статус документации

| Раздел | Статус | Обновлено |
|--------|--------|-----------|
| Modules | ✅ Актуально | 2025-10-03 |
| Testing | ✅ Актуально | 2025-10-03 |
| Changelog | ✅ Актуально | 2025-10-03 |
| Archive | ✅ Актуально | 2025-10-03 |

## 🎉 Что нового в v0.0.2

- ✅ 50 unit и E2E тестов с высоким покрытием
- ✅ Factory Provider для Database Module
- ✅ Реорганизация Docker структуры
- ✅ Реорганизация документации
- ✅ Обновлена лицензия (MIT)
- ✅ Метаданные проекта в package.json

---

**License:** MIT  
**Author:** letnull19a  
**Repository:** https://github.com/letnull19A/avatar-gen  
**Последнее обновление:** 2025-10-03
