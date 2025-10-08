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
- **Database**: SQLite or PostgreSQL with TypeORM
- **Image Processing**: Sharp
- **Validation**: Zod + class-validator
- **Logging**: Pino
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure database in `settings.yaml`:

```yaml
app:
  database:
    driver: 'sqlite' # or "postgresql"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/avatar_gen.db'
    # OR for PostgreSQL:
    # network:
    #   host: localhost
    #   port: 5432
    #   username: postgres
    #   password: password
    #   database: avatar_gen
    #   ssl: false
```

3. Start the application:

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## Database Configuration

### TypeORM Setup

The application uses TypeORM for database operations, supporting both SQLite and PostgreSQL:

- **Automatic schema synchronization** in development mode
- **Migration support** for production deployments
- **Multiple driver support** with easy switching

### Configuration Examples

#### SQLite (Default)

```yaml
app:
  database:
    driver: sqlite
    sqlite_params:
      url: 'file:./storage/database/avatar_gen.db'
```

#### PostgreSQL

```yaml
app:
  database:
    driver: postgresql
    network:
      host: postgres
      port: 5432
      username: postgres
      password: password
      database: avatar_gen
      ssl: false
```

## API Documentation

Once the application is running, visit:

- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Docker Support

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Database Migrations

### Create Migration

```bash
pnpm run typeorm:generate -- src/migrations/InitialMigration
```

### Run Migrations

```bash
pnpm run typeorm:run
```

### Revert Migration

```bash
pnpm run typeorm:revert
```

## Project Structure

```
src/
├── modules/
│   ├── avatar/          # Avatar generation and management
│   ├── database/        # Database configuration and entities
│   ├── storage/         # File storage services
│   ├── health/          # Health check endpoints
│   └── logger/          # Logging configuration
├── config/              # Application configuration
└── common/              # Shared utilities and decorators
```

## Environment Variables

The application uses YAML configuration files instead of environment variables:

- `settings.yaml` - Base configuration
- `settings.development.yaml` - Development overrides
- `settings.production.yaml` - Production overrides
- `settings.test.yaml` - Test configuration

## Migration from Prisma

This project has been migrated from Prisma to TypeORM for better multi-database support:

### Changes Made

- ✅ Replaced Prisma with TypeORM
- ✅ Removed .env file dependencies
- ✅ Simplified database configuration
- ✅ Added automatic schema synchronization
- ✅ Maintained API compatibility

### Benefits

- **Multi-database support**: Easy switching between PostgreSQL and SQLite
- **Simplified configuration**: No .env files required
- **Better NestJS integration**: Native TypeORM support
- **Automatic migrations**: Schema synchronization in development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](../../LICENSE) for details.
