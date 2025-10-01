# Avatar Generation Backend

Backend service for generating and managing avatars similar to GitHub/GitLab.

📚 **[Полная документация](./docs/INDEX.md)** | [Database Module](./docs/modules/database/README.md)

## Features

- 🎨 Generate avatars with custom colors and patterns
- 🎯 Multiple size options (16x16 to 512x512 pixels)
- 🎭 Apply filters (grayscale, sepia, negative)
- 💾 Persistent storage with SQLite or PostgreSQL database
- 📁 File-based avatar object storage
- 🔧 YAML configuration
- 📚 OpenAPI/Swagger documentation
- 🐳 Docker support
- 🧪 Comprehensive test coverage

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: SQLite or PostgreSQL with Prisma ORM
- **Image Processing**: Sharp
- **Validation**: Zod + class-validator
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure database in `settings.yaml`:
```yaml
database:
  driver: "sqlite"  # or "postgresql"
  connection:
    maxRetries: 3
    retryDelay: 2000
  sqlite_params:
    url: "file:./prisma/storage/database.sqlite"
  # postgresql_params:
  #   host: "localhost"
  #   port: 5432
  #   database: "avatar_gen"
  #   username: "postgres"
  #   password: "password"
  #   ssl: false
```

3. Generate environment file and Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/swagger`

## API Endpoints

### Generate Avatar
```
POST /api/generate
```

Query parameters:
- `primaryColor` (optional): Primary color for avatar
- `foreignColor` (optional): Secondary color for avatar
- `colorScheme` (optional): Predefined color scheme name
- `seed` (optional): Seed for deterministic generation (max 32 chars)

### Get Avatar
```
GET /api/:id
```

Query parameters:
- `filter` (optional): grayscale, sepia, negative
- `size` (optional): 5-9 (where 2^n, e.g., 6 = 64x64px)

### Delete Avatar
```
DELETE /api/:id
```

### Get Color Schemes
```
GET /api/color-schemes
```

### Health Check
```
GET /api/health
```

## Configuration

The application uses `settings.yaml` for configuration:

```yaml
app:
  save_path: "./storage/avatars"
  server:
    host: "localhost"
    port: 3000
  database:
    driver: "sqlite"  # or "postgresql"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./prisma/storage/database.sqlite"
    # postgresql_params:
    #   host: "localhost"
    #   port: 5432
    #   database: "avatar_gen"
    #   username: "postgres"
    #   password: "password"
    #   ssl: false
```

### Database Configuration

The application supports both SQLite and PostgreSQL databases with automatic connection retry logic:

#### SQLite (Default)
- File-based database
- No additional setup required
- Perfect for development and small deployments

#### PostgreSQL
- Full-featured relational database
- Better performance for production environments
- Requires PostgreSQL server to be running

#### Connection Retry Logic
- **maxRetries**: Number of connection attempts (default: 3)
- **retryDelay**: Delay between attempts in milliseconds (default: 2000)
- Automatic reconnection on connection loss

## Docker

📁 **Docker конфигурация находится в:** [`docker/`](./docker/)

- **[docker/Dockerfile](./docker/Dockerfile)** - Multi-stage Dockerfile для оптимизированной сборки
- **[docker/README.md](./docker/README.md)** - Детальная документация по Docker

### Быстрый старт с Docker Compose

Из корня проекта:

```bash
# Запустить весь проект (frontend + backend + postgres)
docker-compose up -d

# Только backend с SQLite (без PostgreSQL)
docker-compose up avatar-backend --no-deps

# Backend с PostgreSQL
docker-compose up postgres avatar-backend
```

📚 **[Полная документация Docker Compose](../DOCKER_COMPOSE_README.md)**

### Локальная сборка

```bash
# Из корня проекта
docker build -f backend/docker/Dockerfile -t avatar-backend:latest ./backend

# Или из директории backend
cd backend
docker build -f docker/Dockerfile -t avatar-backend:latest .
```

### Запуск контейнера

```bash
# С SQLite (по умолчанию)
docker run -p 3000:3000 \
  -v $(pwd)/storage:/app/storage \
  avatar-backend:latest

# С PostgreSQL
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/avatar_gen \
  avatar-backend:latest
```

📖 **Подробности:** [docker/README.md](./docker/README.md)

## Development

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run env:generate` - Generate .env file from settings.yaml
- `npm run prisma:generate` - Generate .env file and Prisma client
- `npm run prisma:migrate` - Generate .env file and run database migrations
- `npm run prisma:studio` - Generate .env file and open Prisma Studio
- `npm run prisma:reset` - Generate .env file and reset database (development only)
- `npm run prisma:deploy` - Generate .env file and deploy migrations to production

### Project Structure

```
backend/
├── docs/                   # 📚 Документация
│   ├── INDEX.md           # Навигация по документации
│   └── modules/           # Документация модулей
├── docker/                # 🐳 Docker конфигурация
│   ├── Dockerfile         # Multi-stage Dockerfile
│   └── README.md          # Docker документация
├── src/
│   ├── config/            # Configuration modules
│   ├── modules/
│   │   ├── avatar/        # Avatar generation and management
│   │   ├── database/      # Database service
│   │   ├── logger/        # Logging service
│   │   └── storage/       # File storage service
│   ├── common/
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── interfaces/    # TypeScript interfaces
│   │   └── enums/         # Enums
│   └── main.ts            # Application entry point
├── prisma/                # Prisma schema and migrations
├── storage/               # File storage
├── scripts/               # Helper scripts
└── settings.yaml          # Application configuration
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:cov
```

## Architecture

The application follows SOLID principles and uses:

- **Modular architecture** with separate modules for different concerns
- **Dependency injection** for loose coupling
- **Repository pattern** for data access
- **Service layer** for business logic
- **DTO pattern** for data validation
- **Error handling** with proper HTTP status codes

📚 **Подробнее об архитектуре:**
- [Database Module Architecture](./docs/modules/database/ARCHITECTURE.md)
- [Полная документация](./docs/INDEX.md)

## Documentation

Вся документация backend находится в директории [`docs/`](./docs/):

- **[docs/INDEX.md](./docs/INDEX.md)** - Навигация по всей документации
- **[docs/README.md](./docs/README.md)** - Основное руководство (копия этого файла)
- **[docs/modules/database/](./docs/modules/database/)** - Документация Database Module
  - [README](./docs/modules/database/README.md) - Руководство по использованию
  - [Architecture](./docs/modules/database/ARCHITECTURE.md) - Архитектура модуля
  - [Migration Guide](./docs/modules/database/MIGRATION_GUIDE.md) - Руководство по миграции
  - [Changelog](./docs/modules/database/CHANGELOG_MODULE.md) - История изменений
  - [Hotfix v3.0.1](./docs/modules/database/HOTFIX_v3.0.1.md) - Исправление проблемы

## License

ISC

