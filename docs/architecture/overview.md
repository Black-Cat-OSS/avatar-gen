# Обзор архитектуры проекта

**Версия:** 3.0  
**Дата обновления:** 2025-10-03

## 📁 Структура проекта

### Корневая структура

```
avatar-gen/
├── backend/          # NestJS API server
├── frontend/         # React + Vite frontend
├── docker/           # Docker compose конфигурация
├── scripts/          # Скрипты управления
├── docs/             # Документация
├── LICENSE           # MIT License
├── CHANGELOG.md      # История изменений
├── CONTRIBUTING.md   # Правила контрибуции
└── package.json      # Workspace configuration
```

## 📚 Структура документации

```
docs/
├── README.md                       # Главный обзор документации (единственный файл в корне)
│
├── getting-started/               # 🚀 Быстрый старт
│   ├── README.md
│   ├── quick-start.md             # 5-минутный старт
│   └── installation.md            # Детальная установка
│
├── development/                   # 🛠️ Разработка
│   ├── README.md
│   ├── setup.md                   # Настройка окружения
│   ├── database.md                # База данных
│   ├── integration.md             # Frontend-Backend
│   └── troubleshooting.md         # Решение проблем
│
├── deployment/                    # 🐳 Развертывание
│   ├── README.md
│   ├── docker-compose.md          # Docker Compose
│   └── production.md              # Production
│
├── api/                          # 📡 API
│   ├── README.md
│   ├── endpoints.md               # Все endpoints
│   └── examples.md                # Примеры
│
├── testing/                      # 🧪 Тестирование
│   └── README.md                  # Ссылки на тесты
│
├── architecture/                 # 🏗️ Архитектура
│   ├── README.md
│   └── overview.md                # Этот файл
│
├── contributing/                 # 🤝 Контрибуция
│   ├── README.md
│   ├── code-style.md
│   ├── commits.md
│   └── pull-requests.md
│
└── archive/                      # 📦 Архив
    ├── README.md
    ├── backend_task.md            # Первоначальное ТЗ
    ├── MIGRATION_DOCKER_STRUCTURE.md
    ├── REORGANIZATION_PLAN.md
    ├── REORGANIZATION_SUMMARY.md
    └── TESTING_AND_DOCS_UPDATE.md
```

**Принцип организации:** Каждая директория содержит README.md хаб, который
компилирует все темы в этом разделе.

## 🏗️ Структура Backend

### Директории

```
backend/
├── src/                          # Исходный код
│   ├── main.ts                   # Точка входа
│   ├── config/                   # Модуль конфигурации
│   │   ├── config.module.ts
│   │   ├── configuration.ts      # Zod схема валидации
│   │   ├── yaml-config.service.ts
│   │   └── README.md
│   ├── common/                   # Общие компоненты
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── enums/                # Перечисления
│   │   └── interfaces/           # Интерфейсы
│   └── modules/                  # Модули приложения
│       ├── app/                  # Корневой модуль
│       ├── avatar/               # Модуль аватаров (основной)
│       │   ├── modules/
│       │   │   └── generator/    # Генератор изображений
│       │   ├── avatar.controller.ts
│       │   ├── avatar.service.ts
│       │   └── avatar.module.ts
│       ├── database/             # Модуль БД (SQLite/PostgreSQL)
│       │   ├── providers/
│       │   │   ├── sqlite-database.service.ts
│       │   │   └── postgres-database.service.ts
│       │   ├── database.service.ts
│       │   └── database.module.ts
│       ├── health/               # Health check модуль
│       ├── storage/              # Файловое хранилище
│       ├── logger/               # Логирование (Pino)
│       └── initialization/       # Инициализация директорий
│
├── test/                         # E2E тесты
│   ├── health.e2e-spec.ts
│   └── jest-setup.ts
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Схема БД
│   └── migrations/               # Миграции
│
├── storage/                      # Хранилище данных
│   ├── avatars/                  # Сгенерированные аватары (.obj файлы)
│   └── database/                 # SQLite база данных
│       └── database.sqlite
│
├── logs/                         # Логи приложения
├── docker/                       # Docker конфигурация
│   ├── Dockerfile
│   └── README.md
├── docs/                         # Backend документация
│   ├── INDEX.md
│   ├── README.md
│   ├── TESTING.md
│   ├── TEST_RESULTS.md
│   └── modules/
│       └── database/             # Документация модуля БД
├── settings.yaml                 # Основная конфигурация
├── package.json
└── tsconfig.json
```

## 🎨 Структура Frontend

### Директории (Feature-Sliced Design)

```
frontend/
├── src/
│   ├── app/                      # Инициализация приложения
│   │   ├── index.tsx
│   │   ├── providers/            # Провайдеры (Query, Redux)
│   │   └── router/               # Роутинг
│   │
│   ├── pages/                    # Страницы приложения
│   │   ├── home/
│   │   ├── avatar-generator/
│   │   ├── avatar-viewer/
│   │   ├── about/
│   │   └── login/
│   │
│   ├── widgets/                  # Сложные UI блоки
│   │   ├── header/
│   │   ├── footer/
│   │   ├── avatar-card/
│   │   └── mobile-menu/
│   │
│   ├── features/                 # Функциональные фичи
│   │   ├── avatar-generator/
│   │   ├── counter-increment/
│   │   ├── ThemeToggle/
│   │   └── LanguageSwitcher/
│   │
│   ├── entities/                 # Бизнес-сущности
│   │   ├── user/
│   │   └── counter/
│   │
│   └── shared/                   # Переиспользуемый код
│       ├── ui/                   # UI компоненты (shadcn/ui)
│       ├── lib/                  # Утилиты и хелперы
│       ├── api/                  # API клиенты
│       ├── config/               # Конфигурация
│       └── locales/              # i18n переводы
│
├── public/                       # Статические файлы
├── static/                       # Статические страницы (404, 403)
├── docker/                       # Docker конфигурация
│   └── Dockerfile
├── docs/                         # Frontend документация
│   ├── README.md
│   ├── docker-deployment.md
│   └── COMMIT_MESSAGES.md
├── package.json
└── vite.config.ts
```

## 🐳 Docker структура

```
docker/
├── docker-compose.yml            # Базовая конфигурация
├── docker-compose.sqlite.yml     # SQLite профиль
├── docker-compose.postgresql.yml # PostgreSQL профиль
├── README.md                     # Документация Docker
└── DOCKER_BUILD_FIXES.md         # Решение проблем сборки
```

**Dockerfile остаются в модулях:**

- `backend/docker/Dockerfile` - Backend образ
- `frontend/docker/Dockerfile` - Frontend образ

## 📜 Скрипты управления

```
scripts/
├── build.sh              # Сборка образов (с профилями)
├── build-fast.sh         # Быстрая сборка (с кэшем)
├── start.sh              # Запуск сервисов
├── dev.sh                # Dev режим (фоновый)
├── stop.sh               # Остановка (опция --volumes)
├── logs.sh               # Просмотр логов
├── clean.sh              # Очистка Docker
├── setup-dev.sh          # Настройка dev окружения
└── README.md             # Документация скриптов
```

## 🔄 Data Flow

### Генерация аватара

```
User Action (Frontend)
     ↓
React Component (AvatarGenerator)
     ↓
Redux Action / API Call
     ↓
POST /api/generate
     ↓
AvatarController (Backend)
     ↓
AvatarService
     ↓ ┌──────────────────────┐
     ├→│ GeneratorService     │→ Генерация изображения (Sharp)
     ├→│ StorageService       │→ Сохранение .obj файла
     └→│ DatabaseService      │→ Сохранение metadata
        └──────────────────────┘
     ↓
Response (id, createdAt, version)
     ↓
Frontend UI Update
     ↓
Redirect to Avatar Viewer
```

### Получение аватара

```
User Request (GET /api/:id?filter=grayscale&size=7)
     ↓
AvatarController
     ↓
AvatarService
     ↓ ┌──────────────────────┐
     ├→│ DatabaseService      │→ Получение metadata
     ├→│ StorageService       │→ Загрузка .obj файла
     ├→│ Extract image_7n     │→ Выбор нужного размера
     └→│ GeneratorService     │→ Применение фильтра
        └──────────────────────┘
     ↓
Binary Image Response
     ↓
Browser Display / Download
```

## 🗂️ Модули Backend

### Core модули

| Модуль             | Описание                          | Документация                                               |
| ------------------ | --------------------------------- | ---------------------------------------------------------- |
| **Avatar**         | Генерация и управление аватарами  | -                                                          |
| **Database**       | Абстракция БД (SQLite/PostgreSQL) | [Docs](../../backend/docs/modules/database/README.md)      |
| **Storage**        | Файловое хранилище (.obj файлы)   | -                                                          |
| **Health**         | Проверка здоровья приложения      | -                                                          |
| **Logger**         | Централизованное логирование      | -                                                          |
| **Initialization** | Инициализация директорий          | [Docs](../../backend/src/modules/initialization/README.md) |
| **Config**         | Управление конфигурацией (YAML)   | [Docs](../../backend/src/config/README.md)                 |

### Вспомогательные сервисы

- **GeneratorService** - Генерация изображений (Sharp)
- **FilterService** - Применение фильтров (grayscale, sepia, negative)

## 📦 Формат хранения аватаров

Аватары хранятся в виде `.obj` файлов (сериализованные объекты):

```typescript
interface AvatarObject {
  meta_data_name: string; // UUID
  meta_data_created_at: DateTime; // Timestamp
  image_5n: Buffer; // 2^5 = 32px
  image_6n: Buffer; // 2^6 = 64px (default)
  image_7n: Buffer; // 2^7 = 128px
  image_8n: Buffer; // 2^8 = 256px
  image_9n: Buffer; // 2^9 = 512px
}
```

**Расположение:** `backend/storage/avatars/<uuid>.obj`

## 🗄️ База данных

### Схема (Prisma)

```prisma
model Avatar {
  id           String   @id @default(uuid())
  name         String
  createdAt    DateTime @default(now())
  version      String   @default("0.0.1")
  filePath     String   @unique
  primaryColor String?
  foreignColor String?
  colorScheme  String?
  seed         String?

  @@map("avatars")
}
```

**SQLite:** `backend/storage/database/database.sqlite`  
**PostgreSQL:** Настраивается в `settings.yaml`

## 🔧 Конфигурация

### Иерархия настроек

```
settings.yaml                    # Базовая конфигурация
↓ (override)
settings.{NODE_ENV}.yaml        # Окружение-специфичная
↓ (override)
.env                            # Переменные окружения (auto-generated)
```

### Основные параметры

```yaml
app:
  save_path: './storage/avatars'
  server:
    host: '0.0.0.0'
    port: 3000
  database:
    driver: 'sqlite' # или "postgresql"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
  logging:
    level: 'info'
    verbose: false
    pretty: true
```

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────┐
│           Docker Network (bridge)               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐│
│  │   Frontend   │  │   Backend    │  │Postgre││
│  │   (Nginx)    │→ │   (NestJS)   │→ │  SQL  ││
│  │   :80, :443  │  │    :3000     │  │ :5432 ││
│  └──────────────┘  └──────────────┘  └───────┘│
│         ↓                  ↓              ↓    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐│
│  │ Static Files │  │   Storage    │  │  Data ││
│  │   (React)    │  │  (Avatars)   │  │(Volume││
│  └──────────────┘  └──────────────┘  └───────┘│
└─────────────────────────────────────────────────┘
```

## 🧪 Тестирование

### Структура тестов

```
backend/
├── src/
│   ├── config/
│   │   └── yaml-config.service.spec.ts
│   └── modules/
│       ├── health/
│       │   └── health.controller.spec.ts
│       └── avatar/
│           ├── avatar.controller.spec.ts
│           └── avatar.service.spec.ts
└── test/
    ├── health.e2e-spec.ts
    └── jest-setup.ts
```

**Статистика:**

- 50 тестов (4 test suites)
- 100% coverage критических endpoints
- Unit + E2E покрытие

## 🚀 Deployment Flow

```
Development
     ↓
Git Commit (husky pre-commit hook)
     ↓
lint-staged (eslint + prettier)
     ↓
commitlint (validate message)
     ↓
Push to repository
     ↓
Docker Build (./scripts/build.sh)
     ↓
Multi-stage build:
  - Builder stage (compile TS → JS)
  - Production stage (minimal runtime)
     ↓
Docker Compose Deploy
     ↓
Health Checks
     ↓
Production Ready
```

## 📊 Technology Stack

### Backend

```
NestJS 11
├── TypeScript 5.9
├── Prisma 6.16
│   ├── SQLite (dev)
│   └── PostgreSQL (prod)
├── Sharp 0.34 (image processing)
├── Pino (logging)
├── Zod (validation)
├── class-validator
└── Swagger/OpenAPI
```

### Frontend

```
React 18
├── TypeScript 5.9
├── Vite 6 (build tool)
├── Tailwind CSS + SCSS
├── Redux Toolkit (state)
├── React Router 7 (routing)
├── i18next (i18n)
├── shadcn/ui (components)
└── Tanstack Query (data fetching)
```

### Infrastructure

```
Docker
├── Docker Compose (orchestration)
├── Node.js 20 Alpine (backend)
├── Node.js 22 Alpine (frontend build)
└── Nginx Alpine (frontend serve)

Tools
├── pnpm (package manager)
├── ESLint + Prettier (code quality)
├── Husky + lint-staged (git hooks)
├── Commitlint (commit messages)
└── Jest + ts-jest (testing)
```

## 🔐 Security Architecture

### Backend

- **Validation:** class-validator на DTO
- **Sanitization:** Автоматическая очистка входных данных
- **Error Handling:** Централизованная обработка ошибок
- **CORS:** Настраиваемый для безопасного взаимодействия
- **Health Checks:** Мониторинг состояния сервисов

### Frontend

- **Type Safety:** TypeScript строгий режим
- **XSS Protection:** React автоматическая экранизация
- **HTTPS Ready:** Nginx поддержка SSL
- **CSP:** Content Security Policy (configurable)

## 📈 Scalability

### Horizontal Scaling

- **Backend:** Stateless design позволяет запускать несколько инстансов
- **Database:** PostgreSQL поддержка репликации
- **Storage:** Shared volume или S3-compatible storage
- **Load Balancer:** Nginx upstream configuration

### Vertical Scaling

- **Backend:** Настройка CPU и памяти в docker-compose
- **Database:** Connection pooling через Prisma
- **Caching:** Redis integration (в планах)

## 🔗 Связанные документы

- [Backend Architecture](../../backend/docs/README.md)
- [Frontend Architecture](../../frontend/docs/README.md)
- [Database Module](../../backend/docs/modules/database/README.md)
- [Deployment Guide](../deployment/README.md)

---

**Обновлено:** 2025-10-03
