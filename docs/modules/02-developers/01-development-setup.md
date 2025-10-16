# Настройка разработки

## 🎯 Цель

Настроить полноценное окружение разработки для работы с Avatar Generator.

## ⏱️ Время изучения

**30 минут**

## 📋 Предварительные знания

- Node.js 20+ установлен
- Git установлен
- Docker установлен (опционально)
- Базовые навыки работы с командной строкой

## 🔧 Шаг 1: Установка зависимостей

### Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/letnull19A/avatar-gen.git
cd avatar-gen

# Убедитесь, что вы на ветке main
git checkout main
git pull origin main
```

### Установка зависимостей

```bash
# Установка зависимостей для всего проекта
pnpm install

# Или если pnpm не установлен
npm install
```

## 🗄️ Шаг 2: Настройка базы данных

### Вариант A: SQLite (рекомендуется для разработки)

```bash
# Перейдите в папку backend
cd backend

# Настройте базу данных в settings.yaml
# (по умолчанию уже настроена для SQLite)

# Запустите миграции (если необходимо)
npm run typeorm:run

# Или создайте новую миграцию
npm run typeorm:generate -- src/migrations/NewMigration
```

### Вариант B: PostgreSQL

```bash
# Запустите PostgreSQL через Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=avatar_gen \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:17-alpine

# Обновите backend/settings.yaml
# Измените driver с 'sqlite' на 'postgresql'
# Настройте параметры подключения в разделе network

# Запустите миграции
npm run typeorm:run
```

## ⚙️ Шаг 3: Конфигурация окружения

### Backend конфигурация

Файл `backend/settings.yaml`:

```yaml
app:
  storage:
    type: 'local' # или 's3' для production
    local:
      save_path: './storage/avatars'
  server:
    host: '0.0.0.0'
    port: 3000
  database:
    driver: 'sqlite' # или 'postgresql'
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: 'file:./storage/database/database.sqlite'
    # Для PostgreSQL:
    # network:
    #   host: localhost
    #   port: 5432
    #   username: postgres
    #   password: password
    #   database: avatar_gen
    #   ssl: false
  logging:
    level: 'debug' # для разработки
    verbose: true
    pretty: true
```

### Frontend конфигурация

Файл `frontend/src/shared/config/index.ts`:

```typescript
export const ENV_CONFIG = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
} as const;
```

## 🚀 Шаг 4: Запуск в dev режиме

### Способ 1: Запуск всех сервисов одновременно

```bash
# Из корня проекта
pnpm run dev
```

Это запустит:

- Backend на http://localhost:3000
- Frontend на http://localhost:5173
- Hot reload для обоих сервисов

### Способ 2: Запуск сервисов отдельно

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Способ 3: Docker Compose (для изоляции)

```bash
# Запуск всех сервисов в Docker
./scripts/start.sh --dev
```

## 🔍 Шаг 5: Проверка работоспособности

### Проверка Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Swagger UI
open http://localhost:3000/swagger
```

### Проверка Frontend

```bash
# Откройте в браузере
open http://localhost:5173
```

### Проверка интеграции

```bash
# Генерация тестового аватара
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"seed": "test_dev", "colorScheme": "pastel"}'
```

## 🛠️ Шаг 6: Настройка IDE

### VS Code (рекомендуется)

Установите расширения:

```bash
# Установка рекомендуемых расширений
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-json
```

Создайте `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

## 🧪 Шаг 7: Запуск тестов

```bash
# Backend тесты
cd backend
npm test

# Frontend тесты
cd frontend
npm test

# E2E тесты
cd backend
npm run test:e2e
```

## 🔧 Шаг 8: Настройка Git hooks

```bash
# Установка husky hooks
pnpm prepare

# Проверка что hooks работают
git add .
git commit -m "test: setup development environment"
```

## 📊 Шаг 9: Проверка качества кода

```bash
# Линтинг
pnpm run lint

# Форматирование
pnpm run format

# Проверка типов
pnpm run type-check
```

## 🐛 Решение проблем

### Проблема: Ошибка подключения к БД

**Решение:**

```bash
# Проверьте конфигурацию в settings.yaml
cd backend
cat settings.yaml | grep -A 10 database

# Перезапустите миграции
npm run typeorm:run

# Или пересоздайте БД (удалите файл и перезапустите)
rm -f storage/database/database.sqlite
npm run start:dev
```

### Проблема: Порты заняты

**Решение:**

```bash
# Найдите процессы использующие порты
lsof -i :3000
lsof -i :5173

# Убейте процессы
kill -9 <PID>
```

### Проблема: Ошибки TypeScript

**Решение:**

```bash
# Перезапустите TypeScript сервер в VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Или очистите кэш
rm -rf node_modules/.cache
pnpm install
```

## ✅ Проверка настройки

После выполнения всех шагов вы должны:

- [ ] Видеть главную страницу frontend на http://localhost:5173
- [ ] Видеть Swagger UI backend на http://localhost:3000/swagger
- [ ] Уметь сгенерировать аватар через API
- [ ] Видеть логи в консоли (hot reload работает)
- [ ] Запускать тесты без ошибок
- [ ] Линтинг проходит без ошибок

## 🔗 Полезные команды

```bash
# Полезные npm скрипты
pnpm run dev          # Запуск в dev режиме
pnpm run build        # Сборка проекта
pnpm run test         # Запуск тестов
pnpm run lint         # Линтинг кода
pnpm run format       # Форматирование кода
pnpm run type-check   # Проверка типов

# Backend специфичные
cd backend
npm run start:dev     # Backend dev сервер
npm run typeorm:run   # Запуск миграций
npm run typeorm:generate -- src/migrations/NewMigration # Создание миграции
npm run test:cov      # Тесты с покрытием

# Frontend специфичные
cd frontend
npm run dev           # Frontend dev сервер
npm run build         # Сборка frontend
npm run preview       # Предварительный просмотр
npm run storybook     # Storybook
```

## 🎯 Что дальше?

Теперь когда окружение настроено:

- [Структура проекта](02-project-structure.md) - изучите архитектуру
- [Backend разработка](03-backend-development.md) - начните разработку API
- [Frontend разработка](04-frontend-development.md) - создавайте UI компоненты

---

**Предыдущий раздел:** [README](README.md)  
**Следующий раздел:** [Структура проекта](02-project-structure.md)  
**Версия:** 1.0  
**Обновлено:** 2025-01-15
