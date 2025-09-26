# Avatar Generation Backend

Backend service for generating and managing avatars similar to GitHub/GitLab.

## Features

- 🎨 Generate avatars with custom colors and patterns
- 🎯 Multiple size options (16x16 to 512x512 pixels)
- 🎭 Apply filters (grayscale, sepia, negative)
- 💾 Persistent storage with SQLite database
- 📁 File-based avatar object storage
- 🔧 YAML configuration
- 📚 OpenAPI/Swagger documentation
- 🐳 Docker support
- 🧪 Comprehensive test coverage

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: SQLite with Prisma ORM
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

2. Set up environment:
```bash
cp env.example .env
```

3. Generate Prisma client:
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
    driver: "sqlite"
    sqlite_params:
      url: "file:./storage/database.sqlite"
```

## Docker

### Build and run with Docker Compose

```bash
docker-compose up --build
```

### Build Docker image

```bash
docker build -t avatar-backend .
```

### Run container

```bash
docker run -p 3000:3000 -v $(pwd)/storage:/app/storage avatar-backend
```

## Development

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
src/
├── config/                 # Configuration modules
├── modules/
│   ├── avatar/            # Avatar generation and management
│   ├── database/          # Database service
│   └── logger/            # Logging service
├── common/
│   ├── dto/               # Data Transfer Objects
│   ├── interfaces/        # TypeScript interfaces
│   └── enums/             # Enums
└── utils/                 # Utility functions
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

## License

ISC

